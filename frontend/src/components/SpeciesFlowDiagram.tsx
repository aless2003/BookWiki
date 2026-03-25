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
import { Box, Typography, Avatar, Paper, IconButton, Tooltip } from '@mui/material';
import { Visibility as ViewIcon, AddCircleOutline as ExpandIcon } from '@mui/icons-material';
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
    onExpand: (id: number) => void;
}

const SpeciesNode = ({ data }: { data: SpeciesNodeData }) => {
    const navigate = useNavigate();
    const isTarget = data.isTarget;

    return (
        <Paper 
            sx={{ 
                p: 1.5, 
                minWidth: 160, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                border: isTarget ? '2px solid' : '1px solid',
                borderColor: isTarget ? 'primary.main' : 'divider',
                bgcolor: isTarget ? 'rgba(144, 202, 249, 0.08)' : 'background.paper',
                position: 'relative',
                boxShadow: 2,
                '&:hover .node-actions': { opacity: 1 }
            }}
        >
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            
            <Avatar 
                src={data.pictureUrl ? resolveShortcodes(data.pictureUrl) : undefined}
                sx={{ width: 36, height: 36, bgcolor: 'primary.main', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {!data.pictureUrl && data.name.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: isTarget ? 700 : 500, fontSize: '0.85rem' }}>
                    {data.name}
                </Typography>
            </Box>

            <Box className="node-actions" sx={{ display: 'flex', opacity: 0.3, transition: '0.2s' }}>
                <Tooltip title="Expand Relationships">
                    <IconButton size="small" onClick={() => data.onExpand(data.id)}>
                        <ExpandIcon fontSize="small" />
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

const nodeWidth = 180;
const nodeHeight = 60;

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
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const handleExpandRef = React.useRef<(id: number) => Promise<void>>(async () => {});

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleExpand = useCallback(async (speciesId: number) => {
        try {
            // Get current node IDs to avoid refetching everything if we want to be efficient,
            // but for now we just fetch the expansion of this one node and merge.
            const flow = await fetchSpeciesFlow([speciesId]);
            
            setNodes((nds) => {
                const existingIds = new Set(nds.map(n => n.id));
                const newNodes = flow.nodes
                    .filter(n => !existingIds.has(n.id.toString()))
                    .map(n => ({
                        id: n.id.toString(),
                        type: 'speciesNode',
                        data: { 
                            ...n, 
                            storyId, 
                            isTarget: n.id === targetSpeciesId,
                            onExpand: (id: number) => handleExpandRef.current(id)
                        },
                        position: { x: 0, y: 0 }
                    }));
                
                const combinedNodes = [...nds, ...newNodes];
                
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
                            labelStyle: { fill: '#fff', fontWeight: 600, fontSize: 11 },
                            labelBgPadding: [8, 4] as [number, number],
                            labelBgBorderRadius: 4,
                            labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.85 },
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#90caf9', width: 20, height: 20 },
                            markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: '#90caf9', width: 20, height: 20 } : undefined,
                            style: { stroke: '#90caf9', strokeWidth: 2.5 },
                        }));
                    
                    const combinedEdges = [...eds, ...newEdges];
                    // Recalculate layout
                    const layoutedNodes = getLayoutedElements(combinedNodes, combinedEdges);
                    setNodes(layoutedNodes);
                    return combinedEdges;
                });

                return combinedNodes;
            });
        } catch (err) {
            console.error('Failed to expand species flow', err);
        }
    }, [storyId, targetSpeciesId, setNodes, setEdges]);

    useEffect(() => {
        handleExpandRef.current = handleExpand;
    }, [handleExpand]);

    useEffect(() => {
        if (data) {
            const initialNodes: Node[] = data.nodes.map((s) => ({
                id: s.id.toString(),
                type: 'speciesNode',
                data: { 
                    ...s, 
                    storyId, 
                    isTarget: s.id === targetSpeciesId,
                    onExpand: (id: number) => handleExpandRef.current(id)
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
                labelStyle: { fill: '#fff', fontWeight: 600, fontSize: 11 },
                labelBgPadding: [8, 4] as [number, number],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.85 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#90caf9', width: 20, height: 20 },
                markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: '#90caf9', width: 20, height: 20 } : undefined,
                style: { stroke: '#90caf9', strokeWidth: 2.5 },
            }));

            const layoutedNodes = getLayoutedElements(initialNodes, initialEdges);
            setNodes(layoutedNodes);
            setEdges(initialEdges);
        }
    }, [data, storyId, targetSpeciesId, handleExpand, setNodes, setEdges]);

    return (
        <Box sx={{ width: '100%', height: 500, bgcolor: 'rgba(0,0,0,0.25)', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
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
                <Background color="#444" gap={20} size={1} />
                <Controls />
            </ReactFlow>
        </Box>
    );
};

export { SpeciesFlowDiagram };

