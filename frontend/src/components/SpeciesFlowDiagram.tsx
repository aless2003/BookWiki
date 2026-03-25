import React, { useEffect, useCallback } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MarkerType,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import type { Node, Edge, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Avatar, Paper, IconButton, Tooltip, useTheme, alpha } from '@mui/material';
import { 
    Visibility as ViewIcon, 
    AddCircleOutline as ExpandIcon,
    RemoveCircleOutline as CollapseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchSpeciesFlow } from '../utils/speciesApi';
import type { SpeciesFlow } from '../utils/speciesApi';
import { resolveShortcodes } from '../constants/media';
import dagre from 'dagre';

interface SpeciesFlowDiagramProps {
    data: SpeciesFlow;
    storyId: string;
    targetSpeciesId: number;
}

interface SpeciesNodeData {
    id: number;
    name: string;
    pictureUrl?: string;
    isTarget: boolean;
    storyId: string;
    isExpanded?: boolean;
    onToggle: (id: number, isExpanded: boolean) => void;
}

const SpeciesNode = ({ data }: { data: SpeciesNodeData }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isTarget = data.isTarget;

    return (
        <Paper 
            elevation={isTarget ? 4 : 1}
            sx={{ 
                p: 1.25, 
                minWidth: 170, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                border: '1px solid',
                borderColor: isTarget ? 'primary.main' : theme.palette.divider,
                bgcolor: isTarget ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.paper,
                borderRadius: 2,
                position: 'relative',
                transition: '0.2s',
                '&:hover': {
                    borderColor: isTarget ? 'primary.light' : alpha(theme.palette.primary.main, 0.4),
                    boxShadow: theme.shadows[4]
                },
                '&:hover .node-actions': { opacity: 1 }
            }}
        >
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            
            <Avatar 
                src={data.pictureUrl ? resolveShortcodes(data.pictureUrl) : undefined}
                sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: 'primary.main', 
                    border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                    fontSize: '1rem'
                }}
            >
                {!data.pictureUrl && data.name.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: isTarget ? 700 : 500, fontSize: '0.875rem' }}>
                    {data.name}
                </Typography>
            </Box>

            <Box 
                className="node-actions nodrag" 
                sx={{ 
                    display: 'flex', 
                    opacity: 0.4, 
                    transition: '0.2s',
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 4,
                    boxShadow: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 0.25
                }}
            >
                <Tooltip title={data.isExpanded ? "Collapse" : "Expand Relationships"}>
                    <IconButton size="small" onClick={() => data.onToggle(data.id, !!data.isExpanded)}>
                        {data.isExpanded ? <CollapseIcon fontSize="small" color="primary" /> : <ExpandIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                    <IconButton 
                        size="small" 
                        onClick={() => navigate(`/world/${data.storyId}?category=Species%20%26%20Nature&id=${data.id}`)}
                    >
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
        </Paper>
    );
};

const nodeTypes = {
    speciesNode: SpeciesNode,
};

const nodeWidth = 200;
const nodeHeight = 70;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });
};

const SpeciesFlowDiagram: React.FC<SpeciesFlowDiagramProps> = ({ data, storyId, targetSpeciesId }) => {
    const theme = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const handleToggleRef = React.useRef<(id: number, isExpanded: boolean) => Promise<void>>(async () => {});

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleToggle = useCallback(async (speciesId: number, isExpanded: boolean) => {
        if (isExpanded) {
            // Collapse: Remove nodes that were added by this node expansion
            // CRITICAL: We should NOT remove edges that point to the target node
            // as those are likely essential structural connections.
            setEdges((eds) => {
                const edgesToRemove = eds.filter(e => 
                    e.source === speciesId.toString() && 
                    e.target !== targetSpeciesId.toString()
                );
                
                const edgeIdsToRemove = new Set(edgesToRemove.map(e => e.id));
                const targetNodeIds = new Set(edgesToRemove.map(e => e.target));
                
                const remainingEdges = eds.filter(e => !edgeIdsToRemove.has(e.id));
                
                setNodes((nds) => {
                    // Update isExpanded status for the toggled node
                    const updatedNodes = nds.map(n => 
                        n.id === speciesId.toString() ? { ...n, data: { ...n.data, isExpanded: false } } : n
                    );
                    
                    // Filter out nodes that were targets of removed edges AND have no other connections at all
                    const finalNodes = updatedNodes.filter(n => {
                        // Always keep the toggled node and the target node
                        if (n.id === speciesId.toString() || n.id === targetSpeciesId.toString()) return true;
                        
                        // If it wasn't a target of a removed edge, we generally keep it 
                        // (it might be part of another branch)
                        if (!targetNodeIds.has(n.id)) return true;
                        
                        // CRITICAL: Keep if it has ANY connection (incoming or outgoing) in the remaining set
                        // This ensures that if a parent is collapsed, its children are only removed 
                        // if they don't lead to anything else (like the target species).
                        const hasConnections = remainingEdges.some(e => e.target === n.id || e.source === n.id);
                        return hasConnections;
                    });

                    const layoutedNodes = getLayoutedElements(finalNodes, remainingEdges);
                    setNodes(layoutedNodes);
                    return finalNodes;
                });
                return remainingEdges;
            });
            return;
        }

        try {
            const flow = await fetchSpeciesFlow([speciesId]);
            
            setNodes((nds) => {
                const existingIds = new Set(nds.map(n => n.id));
                
                // Mark current node as expanded
                const updatedNds = nds.map(n => 
                    n.id === speciesId.toString() ? { ...n, data: { ...n.data, isExpanded: true } } : n
                );

                const newNodes = flow.nodes
                    .filter(n => !existingIds.has(n.id.toString()))
                    .map(n => ({
                        id: n.id.toString(),
                        type: 'speciesNode',
                        data: { 
                            ...n, 
                            storyId, 
                            isTarget: n.id === targetSpeciesId,
                            isExpanded: false,
                            onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp)
                        },
                        position: { x: 0, y: 0 }
                    }));
                
                const combinedNodes = [...updatedNds, ...newNodes];
                
                setEdges((eds) => {
                    const existingEdgeIds = new Set(eds.map(e => e.id));
                    const newEdges = flow.edges
                        .filter(e => !existingEdgeIds.has(`e-${e.id}`))
                        .map(e => ({
                            id: `e-${e.id}`,
                            source: e.sourceSpeciesId.toString(),
                            target: e.targetSpeciesId.toString(),
                            label: e.label,
                            animated: true,
                            type: 'smoothstep',
                            labelStyle: { fill: theme.palette.text.primary, fontWeight: 600, fontSize: 11 },
                            labelBgPadding: [8, 4] as [number, number],
                            labelBgBorderRadius: 4,
                            labelBgStyle: { fill: theme.palette.background.paper, fillOpacity: 0.9, border: `1px solid ${theme.palette.divider}` },
                            markerEnd: { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 },
                            markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 } : undefined,
                            style: { stroke: theme.palette.primary.main, strokeWidth: 2.5 },
                        }));
                    
                    const combinedEdges = [...eds, ...newEdges];
                    const layoutedNodes = getLayoutedElements(combinedNodes, combinedEdges);
                    setNodes(layoutedNodes);
                    return combinedEdges;
                });

                return combinedNodes;
            });
        } catch (err) {
            console.error('Failed to expand species flow', err);
        }
    }, [storyId, targetSpeciesId, setNodes, setEdges, theme]);

    useEffect(() => {
        handleToggleRef.current = handleToggle;
    }, [handleToggle]);

    useEffect(() => {
        if (data) {
            const initialNodes: Node[] = data.nodes.map((s) => ({
                id: s.id.toString(),
                type: 'speciesNode',
                data: { 
                    ...s, 
                    storyId, 
                    isTarget: s.id === targetSpeciesId,
                    isExpanded: false,
                    onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp)
                },
                position: { x: 0, y: 0 },
            }));

            const initialEdges: Edge[] = data.edges.map(e => ({
                id: `e-${e.id}`,
                source: e.sourceSpeciesId.toString(),
                target: e.targetSpeciesId.toString(),
                label: e.label,
                animated: true,
                type: 'smoothstep',
                labelStyle: { fill: theme.palette.text.primary, fontWeight: 600, fontSize: 11 },
                labelBgPadding: [8, 4] as [number, number],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: theme.palette.background.paper, fillOpacity: 0.9, border: `1px solid ${theme.palette.divider}` },
                markerEnd: { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 },
                markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 } : undefined,
                style: { stroke: theme.palette.primary.main, strokeWidth: 2.5 },
            }));

            const layoutedNodes = getLayoutedElements(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(initialEdges);
        }
    }, [data, storyId, targetSpeciesId, setNodes, setEdges, theme]);

    return (
        <Box 
            sx={{ 
                width: '100%', 
                height: 550, 
                bgcolor: alpha(theme.palette.background.default, 0.4), 
                borderRadius: 3, 
                overflow: 'hidden', 
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
            }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                zoomOnScroll={false}
                preventScrolling={false}
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={1.5}
            >
                <Background color={theme.palette.divider} gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </Box>
    );
};

export { SpeciesFlowDiagram };

