import React, { useEffect, useCallback, useMemo, useState } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    MarkerType,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    Panel
} from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { 
    Box, 
    Typography, 
    Avatar, 
    Paper, 
    IconButton, 
    Tooltip, 
    useTheme, 
    alpha,
    ToggleButton,
    ToggleButtonGroup,
    Chip,
    CircularProgress
} from '@mui/material';
import { 
    Visibility as ViewIcon, 
    AddCircleOutline as ExpandIcon,
    RemoveCircleOutline as CollapseIcon,
    VerticalAlignBottom as VerticalIcon,
    SwapHoriz as HorizontalIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchSpeciesFlow } from '../utils/speciesApi';
import type { SpeciesFlow } from '../utils/speciesApi';
import { resolveShortcodes } from '../constants/media';
import ELK from 'elkjs/lib/elk.bundled.js';

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
    isInitial?: boolean;
    isHighlighted?: boolean;
    isDimmed?: boolean;
    onToggle: (id: number, isExpanded: boolean) => void;
    onNavigate: (id: number) => void;
}

const nodeWidth = 220;
const nodeHeight = 80;

const SpeciesNode = ({ data }: { data: SpeciesNodeData }) => {
    const theme = useTheme();
    const isTarget = data.isTarget;

    return (
        <Paper 
            elevation={isTarget ? 6 : 2}
            sx={{ 
                p: 1.5, 
                width: nodeWidth, 
                height: nodeHeight,
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                border: '2px solid',
                borderColor: isTarget 
                    ? theme.palette.primary.main 
                    : data.isHighlighted 
                        ? alpha(theme.palette.primary.main, 0.6)
                        : theme.palette.divider,
                bgcolor: isTarget 
                    ? alpha(theme.palette.primary.main, 0.08) 
                    : theme.palette.background.paper,
                borderRadius: 3,
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: data.isDimmed ? 0.4 : 1,
                transform: data.isHighlighted ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isTarget 
                    ? `0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`
                    : data.isHighlighted
                        ? `0 0 10px ${alpha(theme.palette.primary.main, 0.2)}`
                        : theme.shadows[2],
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
                    transform: 'translateY(-2px) scale(1.02)',
                    zIndex: 10
                },
                '&:hover .node-actions': { opacity: 1 }
            }}
        >
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
            <Handle type="target" position={Position.Left} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Right} style={{ visibility: 'hidden' }} />
            
            <Avatar 
                src={data.pictureUrl ? resolveShortcodes(data.pictureUrl) : undefined}
                sx={{ 
                    width: 48, 
                    height: 48, 
                    bgcolor: isTarget ? 'primary.main' : alpha(theme.palette.primary.main, 0.1),
                    color: isTarget ? 'white' : 'primary.main',
                    border: `2px solid ${isTarget ? 'white' : alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: 1,
                    fontSize: '1.25rem',
                    fontWeight: 700
                }}
            >
                {!data.pictureUrl && data.name.charAt(0)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography 
                    variant="subtitle1" 
                    noWrap 
                    sx={{ 
                        fontWeight: isTarget ? 700 : 600, 
                        fontSize: '0.9rem',
                        color: isTarget ? 'primary.main' : 'text.primary',
                        lineHeight: 1.2
                    }}
                >
                    {data.name}
                </Typography>
                {isTarget && (
                    <Chip 
                        label="Primary" 
                        size="small" 
                        color="primary" 
                        sx={{ height: 16, fontSize: '0.65rem', fontWeight: 700, mt: 0.5 }} 
                    />
                )}
            </Box>

            <Box 
                className="node-actions nodrag" 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: 0, 
                    transition: '0.2s',
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    boxShadow: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 0.5,
                    gap: 0.5,
                    zIndex: 20
                }}
            >
                <Tooltip title={data.isExpanded ? "Collapse Connections" : "Expand Connections"}>
                    <IconButton 
                        size="small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onToggle(data.id, !!data.isExpanded);
                        }}
                        sx={{ color: data.isExpanded ? 'secondary.main' : 'primary.main' }}
                    >
                        {data.isExpanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
                <Tooltip title="View Details">
                    <IconButton 
                        size="small" 
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onNavigate(data.id);
                        }}
                    >
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    );
};

const nodeTypes = {
    speciesNode: SpeciesNode,
};

const elk = new ELK();

const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.direction': 'DOWN',
    'elk.padding': '[top=50,left=50,bottom=50,right=50]',

    // 1. IMPROVE PLACEMENT STRATEGY (The "Fixer")
    // BRANDES_KOEPF is much smarter about centering nodes relative to their edges
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',

    // 2. STRENGTHEN EDGE ROUTING
    'elk.edgeRouting': 'ORTHOGONAL',
    // Ensures edges keep a distance from nodes even during the routing phase
    'elk.layered.edgeRouting.combinedStrategy': 'true',

    // 3. AGGRESSIVE SPACING
    'elk.spacing.nodeNode': '120',
    'elk.spacing.edgeNode': '80', // Increased to give labels room
    'elk.layered.spacing.nodeNodeBetweenLayers': '150', // Vertical gap for labels

    // 4. LABEL HANDLING
    // This tells ELK to actually reserve space for the text on the lines
    'elk.edgeLabels.placement': 'CENTER',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',

    // Keep your existing helpful flags
    'elk.layered.unnecessaryBendpoints': 'true',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
};

const getLayoutedElements = async (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
    const isHorizontal = direction === 'LR';
    
    const elkNodes = nodes.map((node) => ({
        id: node.id,
        width: nodeWidth,
        height: nodeHeight,
    }));

    const elkEdges = edges.map((edge) => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
    }));

    const layout = await elk.layout({
        id: 'root',
        layoutOptions: {
            ...elkOptions,
            'elk.direction': isHorizontal ? 'RIGHT' : 'DOWN',
        },
        children: elkNodes,
        edges: elkEdges,
    });

    return nodes.map((node) => {
        const elkNode = layout.children?.find((n) => n.id === node.id);
        if (elkNode) {
            node.position = { x: elkNode.x || 0, y: elkNode.y || 0 };
        }
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        };
    });
};

const SpeciesFlowDiagram: React.FC<SpeciesFlowDiagramProps> = ({ data, storyId, targetSpeciesId }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [loading, setLoading] = useState(false);
    const [direction, setDirection] = useState<'TB' | 'LR'>('TB');
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const handleToggleRef = React.useRef<(id: number, isExpanded: boolean) => Promise<void>>(async () => {});

    const updateGraphLayout = useCallback(async (newNodes: Node[], newEdges: Edge[], dir: 'TB' | 'LR' = direction) => {
        setLoading(true);
        try {
            const layoutedNodes = await getLayoutedElements(newNodes, newEdges, dir);
            setNodes(layoutedNodes);
            setEdges(newEdges);
        } catch (err) {
            console.error('Layout failed', err);
        } finally {
            setLoading(false);
        }
    }, [direction, setNodes, setEdges]);

    const handleToggle = useCallback(async (speciesId: number, isExpanded: boolean) => {
        if (isExpanded) {
            // Collapse logic
            const updatedNodes = nodes.map(n => 
                n.id === speciesId.toString() ? { ...n, data: { ...n.data, isExpanded: false } } : n
            );

            const legitNodes = new Set<string>();
            const queue: string[] = [];

            updatedNodes.forEach(n => {
                if (n.data.isInitial || n.id === targetSpeciesId.toString()) {
                    legitNodes.add(n.id);
                    queue.push(n.id);
                }
            });

            while (queue.length > 0) {
                const currId = queue.shift()!;
                const currNode = updatedNodes.find(n => n.id === currId);
                
                if (currNode && currNode.data.isExpanded) {
                    for (const edge of edges) {
                        if (edge.source === currId && !legitNodes.has(edge.target)) {
                            legitNodes.add(edge.target);
                            queue.push(edge.target);
                        } else if (edge.target === currId && !legitNodes.has(edge.source)) {
                            legitNodes.add(edge.source);
                            queue.push(edge.source);
                        }
                    }
                }
            }

            const finalNodes = updatedNodes.filter(n => legitNodes.has(n.id));
            const finalEdges = edges.filter(e => 
                legitNodes.has(e.source) && legitNodes.has(e.target)
            );

            // If no nodes or edges were removed, just update the expansion state without re-layout
            if (finalNodes.length === nodes.length && finalEdges.length === edges.length) {
                setNodes(updatedNodes);
            } else {
                await updateGraphLayout(finalNodes, finalEdges);
            }
            return;
        }

        try {
            setLoading(true);
            const flow = await fetchSpeciesFlow([speciesId]);
            
            const existingIds = new Set(nodes.map(n => n.id));
            const existingEdgeIds = new Set(edges.map(e => e.id));

            const newNodesData = flow.nodes.filter(n => !existingIds.has(n.id.toString()));
            const newEdgesData = flow.edges.filter(e => !existingEdgeIds.has(`e-${e.id}`));

            const updatedNodes = nodes.map(n => 
                n.id === speciesId.toString() ? { ...n, data: { ...n.data, isExpanded: true } } : n
            );

            // If no new nodes or edges were added, just update the expansion state without re-layout
            if (newNodesData.length === 0 && newEdgesData.length === 0) {
                setNodes(updatedNodes);
                setLoading(false);
                return;
            }

            const newNodes = newNodesData.map(n => ({
                id: n.id.toString(),
                type: 'speciesNode',
                data: { 
                    ...n, 
                    storyId, 
                    isTarget: n.id === targetSpeciesId,
                    isExpanded: false,
                    isInitial: false,
                    onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp),
                    onNavigate: (id: number) => navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${id}`)
                },
                position: { x: 0, y: 0 }
            }));
            
            const combinedNodes = [...updatedNodes, ...newNodes];
            
            const newEdges = newEdgesData.map(e => ({
                id: `e-${e.id}`,
                source: e.sourceSpeciesId.toString(),
                target: e.targetSpeciesId.toString(),
                label: e.label,
                animated: true,
                type: 'smoothstep',
                labelStyle: { fill: theme.palette.text.primary, fontWeight: 600, fontSize: 10 },
                labelBgPadding: [6, 3] as [number, number],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: theme.palette.background.paper, fillOpacity: 0.8 },
                markerEnd: { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 },
                markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20, orient: 'auto-start-reverse' } : undefined,
                style: { stroke: alpha(theme.palette.primary.main, 0.5), strokeWidth: 2 },
            }));
            
            const combinedEdges = [...edges, ...newEdges];
            await updateGraphLayout(combinedNodes, combinedEdges);
        } catch (err) {
            console.error('Failed to expand species flow', err);
        } finally {
            setLoading(false);
        }
    }, [nodes, edges, targetSpeciesId, setNodes, updateGraphLayout, storyId, navigate, theme.palette.text.primary, theme.palette.background.paper, theme.palette.primary.main]);

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
                    isInitial: true,
                    onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp),
                    onNavigate: (id: number) => navigate(`/world/${storyId}?category=Species%20%26%20Nature&id=${id}`)
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
                labelStyle: { fill: theme.palette.text.primary, fontWeight: 600, fontSize: 10 },
                labelBgPadding: [6, 3] as [number, number],
                labelBgBorderRadius: 4,
                labelBgStyle: { fill: theme.palette.background.paper, fillOpacity: 0.8 },
                markerEnd: { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20 },
                markerStart: e.isBidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20, orient: 'auto-start-reverse' } : undefined,
                style: { stroke: alpha(theme.palette.primary.main, 0.5), strokeWidth: 2 },
            }));

            updateGraphLayout(initialNodes, initialEdges);
        }
    }, [data, storyId, targetSpeciesId, updateGraphLayout, navigate, theme]);

    // Highlighting logic
    const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
        setHoveredNode(node.id);
    }, []);

    const onNodeMouseLeave = useCallback(() => {
        setHoveredNode(null);
    }, []);

    const highlightedEdges = useMemo(() => {
        if (!hoveredNode) return edges;
        return edges.map(edge => {
            const isConnected = edge.source === hoveredNode || edge.target === hoveredNode;
            return {
                ...edge,
                animated: isConnected,
                style: {
                    ...edge.style,
                    stroke: isConnected ? theme.palette.secondary.main : alpha(theme.palette.primary.main, 0.1),
                    strokeWidth: isConnected ? 3 : 1,
                    zIndex: isConnected ? 10 : 0
                }
            };
        });
    }, [edges, hoveredNode, theme]);

    const highlightedNodes = useMemo(() => {
        if (!hoveredNode) return nodes;
        
        const connectedNodeIds = new Set<string>([hoveredNode]);
        edges.forEach(edge => {
            if (edge.source === hoveredNode) connectedNodeIds.add(edge.target);
            if (edge.target === hoveredNode) connectedNodeIds.add(edge.source);
        });

        return nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                isHighlighted: node.id === hoveredNode,
                isDimmed: !connectedNodeIds.has(node.id)
            }
        }));
    }, [nodes, edges, hoveredNode]);

    return (
        <Box 
            sx={{ 
                width: '100%', 
                height: 600, 
                bgcolor: alpha(theme.palette.background.paper, 0.5), 
                borderRadius: 4, 
                overflow: 'hidden', 
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                '& .react-flow__controls': {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(8px)',
                    p: 0.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: 4,
                },
                '& .react-flow__controls-button': {
                    bgcolor: 'transparent',
                    border: 'none',
                    borderBottom: 'none',
                    color: theme.palette.text.secondary,
                    transition: '0.2s',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                    },
                    '& svg': {
                        fill: 'currentColor',
                    }
                }
            }}
        >
            {loading && (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <CircularProgress color="primary" />
                </Box>
            )}
            
            <ReactFlow
                nodes={highlightedNodes}
                edges={highlightedEdges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeMouseEnter={onNodeMouseEnter}
                onNodeMouseLeave={onNodeMouseLeave}
                fitView
                zoomOnScroll={true}
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.1}
                maxZoom={2}
            >
                <Background 
                    color={theme.palette.divider} 
                    gap={20} 
                    size={1} 
                />
                
                <Panel position="top-right">
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Paper 
                            elevation={4} 
                            sx={{ 
                                p: 0.5, 
                                display: 'flex', 
                                gap: 0.5, 
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                backdropFilter: 'blur(8px)',
                                border: `1px solid ${theme.palette.divider}`,
                            }}
                        >
                            <ToggleButtonGroup
                                value={direction}
                                exclusive
                                onChange={(_, val) => {
                                    if (val) {
                                        setDirection(val);
                                        updateGraphLayout(nodes, edges, val);
                                    }
                                }}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root': {
                                        border: 'none',
                                        color: theme.palette.text.secondary,
                                        '&.Mui-selected': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                                            color: theme.palette.primary.main,
                                        }
                                    }
                                }}
                            >
                                <ToggleButton value="TB" aria-label="Vertical Layout">
                                    <Tooltip title="Vertical Layout"><VerticalIcon fontSize="small" /></Tooltip>
                                </ToggleButton>
                                <ToggleButton value="LR" aria-label="Horizontal Layout">
                                    <Tooltip title="Horizontal Layout"><HorizontalIcon fontSize="small" /></Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Paper>
                    </Box>
                </Panel>

                <Controls 
                    showInteractive={false} 
                    style={{ 
                        display: 'flex', 
                        flexDirection: 'row',
                        bottom: 10,
                        left: 10,
                        margin: 0
                    }}
                />
                <MiniMap 
                    nodeColor={(n) => {
                        if (n.data?.isTarget) return theme.palette.primary.main;
                        return alpha(theme.palette.text.disabled, 0.3);
                    }}
                    maskColor={alpha(theme.palette.background.default, 0.7)}
                    style={{ 
                        height: 120, 
                        width: 160,
                        borderRadius: 12, 
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
                    }}
                />
            </ReactFlow>
        </Box>
    );
};

export { SpeciesFlowDiagram };
