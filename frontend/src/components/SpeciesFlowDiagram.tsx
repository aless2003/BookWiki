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
    isInitial?: boolean;
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
            {/* Target Handles (Top) */}
            {Array.from({ length: MAX_HANDLES }).map((_, i) => (
                <Handle
                    key={`t-${i}`}
                    type="target"
                    position={Position.Top}
                    id={`t-${i}`}
                    style={{ left: `${(i + 1) * (100 / (MAX_HANDLES + 1))}%`, visibility: 'hidden' }}
                />
            ))}
            
            {/* Source Handles (Bottom) */}
            {Array.from({ length: MAX_HANDLES }).map((_, i) => (
                <Handle
                    key={`s-${i}`}
                    type="source"
                    position={Position.Bottom}
                    id={`s-${i}`}
                    style={{ left: `${(i + 1) * (100 / (MAX_HANDLES + 1))}%`, visibility: 'hidden' }}
                />
            ))}

            {/* Target Handles (Left) for horizontal layout */}
            {Array.from({ length: MAX_HANDLES }).map((_, i) => (
                <Handle
                    key={`tl-${i}`}
                    type="target"
                    position={Position.Left}
                    id={`tl-${i}`}
                    style={{ top: `${(i + 1) * (100 / (MAX_HANDLES + 1))}%`, visibility: 'hidden' }}
                />
            ))}
            
            {/* Source Handles (Right) for horizontal layout */}
            {Array.from({ length: MAX_HANDLES }).map((_, i) => (
                <Handle
                    key={`sr-${i}`}
                    type="source"
                    position={Position.Right}
                    id={`sr-${i}`}
                    style={{ top: `${(i + 1) * (100 / (MAX_HANDLES + 1))}%`, visibility: 'hidden' }}
                />
            ))}
            
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
        </Paper>
    );
};

const nodeTypes = {
    speciesNode: SpeciesNode,
};

const nodeWidth = 200;
const nodeHeight = 70;
const MAX_HANDLES = 15;

/** How far along the rank axis before we treat an edge as “forward/back” vs same-rank cross traffic. */
const FLOW_AXIS_THRESHOLD = 40;

/**
 * Handle indices: bi vs uni buckets along the main dagre axis; lateral split only when nearly same rank.
 */
const HANDLE = {
    tb: {
        srcBi: 7,
        srcUniDown: 8,
        srcUniUp: 2,
        srcUniCrossNeg: 3,
        srcUniCrossPos: 13,
        tgtBi: 7,
        tgtUniFromAbove: 6,
        tgtUniFromBelow: 11,
        tgtUniCrossNegDx: 11,
        tgtUniCrossPosDx: 1,
    },
    lr: {
        srcBi: 7,
        srcUniForward: 8,
        srcUniBackward: 2,
        srcUniCrossNeg: 3,
        srcUniCrossPos: 13,
        tgtBi: 7,
        tgtUniFromForward: 6,
        tgtUniFromBackward: 11,
        tgtUniCrossNegDy: 11,
        tgtUniCrossPosDy: 1,
    },
} as const;

/**
 * Groups edges onto shared handles by type:
 * - Bidirectional → one point per node side
 * - Unidirectional → one point per rank direction (TB: below vs above vs same-row left/right; LR: right vs left vs same-column up/down)
 */
const assignHandleIds = (nodes: Node[], edges: Edge[], direction: string = 'TB') => {
    const isHorizontal = direction === 'LR';
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    return edges.map(e => {
        const sourceNode = nodeMap.get(e.source);
        const targetNode = nodeMap.get(e.target);

        if (!sourceNode || !targetNode) return e;

        const isBi = !!e.markerStart;
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;

        if (isHorizontal) {
            const H = HANDLE.lr;
            const srcIdx = isBi
                ? H.srcBi
                : dx > FLOW_AXIS_THRESHOLD
                  ? H.srcUniForward
                  : dx < -FLOW_AXIS_THRESHOLD
                    ? H.srcUniBackward
                    : dy <= 0
                      ? H.srcUniCrossNeg
                      : H.srcUniCrossPos;
            const tgtIdx = isBi
                ? H.tgtBi
                : dx > FLOW_AXIS_THRESHOLD
                  ? H.tgtUniFromForward
                  : dx < -FLOW_AXIS_THRESHOLD
                    ? H.tgtUniFromBackward
                    : dy > 0
                      ? H.tgtUniCrossPosDy
                      : H.tgtUniCrossNegDy;
            return {
                ...e,
                sourceHandle: `sr-${srcIdx}`,
                targetHandle: `tl-${tgtIdx}`,
            };
        }

        const H = HANDLE.tb;
        const srcIdx = isBi
            ? H.srcBi
            : dy > FLOW_AXIS_THRESHOLD
              ? H.srcUniDown
              : dy < -FLOW_AXIS_THRESHOLD
                ? H.srcUniUp
                : dx <= 0
                  ? H.srcUniCrossNeg
                  : H.srcUniCrossPos;
        const tgtIdx = isBi
            ? H.tgtBi
            : dy > FLOW_AXIS_THRESHOLD
              ? H.tgtUniFromAbove
              : dy < -FLOW_AXIS_THRESHOLD
                ? H.tgtUniFromBelow
                : dx > 0
                  ? H.tgtUniCrossPosDx
                  : H.tgtUniCrossNegDx;
        return {
            ...e,
            sourceHandle: `s-${srcIdx}`,
            targetHandle: `t-${tgtIdx}`,
        };
    });
};

const getConnectedComponents = (nodes: Node[], edges: Edge[]) => {
    const adj = new Map<string, string[]>();
    nodes.forEach(n => adj.set(n.id, []));
    edges.forEach(e => {
        if (adj.has(e.source) && adj.has(e.target)) {
            adj.get(e.source)!.push(e.target);
            adj.get(e.target)!.push(e.source);
        }
    });

    const visited = new Set<string>();
    const components: string[][] = [];

    nodes.forEach(n => {
        if (!visited.has(n.id) && n.type !== 'group') {
            const comp: string[] = [];
            const q = [n.id];
            visited.add(n.id);

            while (q.length > 0) {
                const curr = q.shift()!;
                comp.push(curr);
                for (const neighbor of adj.get(curr)!) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        q.push(neighbor);
                    }
                }
            }
            components.push(comp);
        }
    });

    return components;
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], theme: any, direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    const realNodes = nodes.filter(n => n.type !== 'group');

    realNodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = realNodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            }
        };
    });

    const components = getConnectedComponents(layoutedNodes, edges);
    const finalNodes: Node[] = [];
    const padding = 50;

    components.forEach((compNodes, index) => {
        const compId = `group-${index}`;
        const cNodes = layoutedNodes.filter(n => compNodes.includes(n.id));
        
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        cNodes.forEach(n => {
            if (n.position.x < minX) minX = n.position.x;
            if (n.position.y < minY) minY = n.position.y;
            if (n.position.x + nodeWidth > maxX) maxX = n.position.x + nodeWidth;
            if (n.position.y + nodeHeight > maxY) maxY = n.position.y + nodeHeight;
        });

        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;

        const width = maxX - minX;
        const height = maxY - minY;

        finalNodes.push({
            id: compId,
            type: 'group',
            data: {},
            position: { x: minX, y: minY },
            style: {
                width,
                height,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 16,
                zIndex: -1,
            },
        });

        cNodes.forEach(n => {
            finalNodes.push({
                ...n,
                parentNode: compId,
                extent: 'parent',
                position: {
                    x: n.position.x - minX,
                    y: n.position.y - minY,
                },
                zIndex: 1
            });
        });
    });

    return finalNodes;
};

const SpeciesFlowDiagram: React.FC<SpeciesFlowDiagramProps> = ({ data, storyId, targetSpeciesId }) => {
    const theme = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const handleToggleRef = React.useRef<(id: number, isExpanded: boolean) => Promise<void>>(async () => {});

    const onConnect = useCallback((params: Connection) => setEdges((eds) => {
        const combinedEdges = addEdge(params, eds);
        return assignHandleIds(nodes, combinedEdges, 'TB');
    }), [setEdges, nodes]);

    const handleToggle = useCallback(async (speciesId: number, isExpanded: boolean) => {
        if (isExpanded) {
            // 1. Mark the node as no longer expanded in current nodes state
            const updatedNodes = nodes.map(n => 
                n.id === speciesId.toString() ? { ...n, data: { ...n.data, isExpanded: false } } : n
            );

            // 2. BFS to find reachable nodes starting from the core (initial nodes + the toggled node)
            // A node is reachable if it's initial OR if it's connected to a reachable expanded node.
            const legitNodes = new Set<string>();
            const queue: string[] = [];

            // Add all initial nodes and the toggled node to the start of BFS
            updatedNodes.forEach(n => {
                if (n.data.isInitial || n.id === speciesId.toString()) {
                    legitNodes.add(n.id);
                    queue.push(n.id);
                }
            });

            while (queue.length > 0) {
                const currId = queue.shift()!;
                const currNode = updatedNodes.find(n => n.id === currId);
                
                // If the current node is expanded, all its neighbors become legit
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

            // 3. Filter nodes and edges based on the legit set
            const finalNodes = updatedNodes.filter(n => legitNodes.has(n.id));
            const finalEdges = edges.filter(e => 
                legitNodes.has(e.source) && legitNodes.has(e.target)
            );

            // 4. Layout and update both states with unique handles
            const layoutedNodes = getLayoutedElements(finalNodes, finalEdges, theme);
            const edgesWithHandles = assignHandleIds(layoutedNodes, finalEdges, 'TB');
            setNodes(layoutedNodes);
            setEdges(edgesWithHandles);
            return;
        }

        try {
            const flow = await fetchSpeciesFlow([speciesId]);
            
            const existingIds = new Set(nodes.map(n => n.id));
            
            // Mark current node as expanded
            const updatedNodes = nodes.map(n => 
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
                        isInitial: false,
                        onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp)
                    },
                    position: { x: 0, y: 0 }
                }));
            
            const combinedNodes = [...updatedNodes, ...newNodes];
            
            const existingEdgeIds = new Set(edges.map(e => e.id));
            const newEdges = flow.edges
                .filter(e => !existingEdgeIds.has(`e-${e.id}`))
                .map(e => {
                    console.log(`Connection [e-${e.id}] between ${e.sourceSpeciesId} and ${e.targetSpeciesId} - bidirectional: ${e.bidirectional}`);
                    return {
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
                        markerStart: e.bidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20, orient: 'auto-start-reverse' } : undefined,
                        style: { stroke: theme.palette.primary.main, strokeWidth: 2.5 },
                    };
                });
            
            const combinedEdges = [...edges, ...newEdges];
            const layoutedNodes = getLayoutedElements(combinedNodes, combinedEdges, theme);
            const edgesWithHandles = assignHandleIds(layoutedNodes, combinedEdges, 'TB');
            
            setNodes(layoutedNodes);
            setEdges(edgesWithHandles);
        } catch (err) {
            console.error('Failed to expand species flow', err);
        }
    }, [storyId, targetSpeciesId, setNodes, setEdges, theme, nodes, edges]);

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
                    onToggle: (id: number, exp: boolean) => handleToggleRef.current(id, exp)
                },
                position: { x: 0, y: 0 },
            }));

            const initialEdges: Edge[] = data.edges.map(e => {
                console.log(`Initial connection [e-${e.id}] between ${e.sourceSpeciesId} and ${e.targetSpeciesId} - bidirectional: ${e.bidirectional}`);
                return {
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
                    markerStart: e.bidirectional ? { type: MarkerType.ArrowClosed, color: theme.palette.primary.main, width: 20, height: 20, orient: 'auto-start-reverse' } : undefined,
                    style: { stroke: theme.palette.primary.main, strokeWidth: 2.5 },
                };
            });

            const layoutedNodes = getLayoutedElements(initialNodes, initialEdges, theme);
            const edgesWithHandles = assignHandleIds(layoutedNodes, initialEdges, 'TB');
            setNodes(layoutedNodes);
            setEdges(edgesWithHandles);
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
