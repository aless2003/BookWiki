import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkExtendedEdge, ElkNode, LayoutOptions } from 'elkjs/lib/elk-api';
import type { Edge, Node } from 'reactflow';

const elk = new ELK();

export type SpeciesFlowLayoutDims = {
    nodeWidth: number;
    nodeHeight: number;
};

const toElkEdge = (e: Edge): ElkExtendedEdge => ({
    id: e.id,
    sources: [e.source],
    targets: [e.target],
});

const rootLayoutOptions = (direction: 'DOWN' | 'RIGHT'): LayoutOptions => ({
    'elk.algorithm': 'layered',
    'elk.direction': direction,
    'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.spacing.nodeNode': '72',
    'elk.layered.spacing.nodeNodeBetweenLayers': '120',
    'elk.layered.spacing.edgeNodeBetweenLayers': '52',
    'elk.layered.spacing.edgeEdgeBetweenLayers': '28',
    'elk.spacing.edgeNode': '26',
    'elk.layered.nodePlacement.bk.edgeStraightening': 'IMPROVE_STRAIGHTNESS',
    'elk.layered.cycleHandling': 'GREEDY',
    'elk.padding': '[top=24,left=24,bottom=24,right=24]',
    'elk.separateConnectedComponents': 'true',
});

const groupLayoutOptions = (siblingDirection: 'RIGHT' | 'DOWN'): LayoutOptions => ({
    'elk.algorithm': 'layered',
    'elk.direction': siblingDirection,
    'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.edgeRouting': 'ORTHOGONAL',
    'elk.spacing.nodeNode': '74',
    'elk.layered.spacing.nodeNodeBetweenLayers': '70',
    'elk.spacing.edgeNode': '22',
    'elk.padding': '[top=20,left=20,bottom=20,right=20]',
});

function partitionEdges(
    edges: Edge[],
    initialIds: Set<string>
): { internalInitial: Edge[]; internalExpanded: Edge[]; cross: Edge[] } {
    const internalInitial: Edge[] = [];
    const internalExpanded: Edge[] = [];
    const cross: Edge[] = [];
    for (const e of edges) {
        const si = initialIds.has(e.source);
        const ti = initialIds.has(e.target);
        if (si && ti) internalInitial.push(e);
        else if (!si && !ti) internalExpanded.push(e);
        else cross.push(e);
    }
    return { internalInitial, internalExpanded, cross };
}

function collectAbsolutePositions(
    n: ElkNode,
    originX: number,
    originY: number,
    leafIds: Set<string>,
    out: Map<string, { x: number; y: number }>
): void {
    const x = originX + (n.x ?? 0);
    const y = originY + (n.y ?? 0);
    if (leafIds.has(n.id)) {
        out.set(n.id, { x, y });
    }
    for (const c of n.children ?? []) {
        collectAbsolutePositions(c, x, y, leafIds, out);
    }
}

/**
 * ELK “layered” hierarchic layout with optional group strips (initial vs expanded species),
 * similar in spirit to yFiles hierarchic grouping: bands for each group, crossing minimization,
 * and inter-group edges routed at the parent level.
 */
function buildElkGraph(nodes: Node[], edges: Edge[], direction: 'TB' | 'LR'): ElkNode {
    const elkMainDir: 'DOWN' | 'RIGHT' = direction === 'LR' ? 'RIGHT' : 'DOWN';
    const siblingDir: 'RIGHT' | 'DOWN' = direction === 'TB' ? 'RIGHT' : 'DOWN';

    const initial = nodes.filter((n) => n.data?.isInitial === true);
    const expanded = nodes.filter((n) => !n.data?.isInitial);
    const useGroups = initial.length > 0 && expanded.length > 0;

    const w = (n: Node) => (typeof n.width === 'number' ? n.width : 0);
    const h = (n: Node) => (typeof n.height === 'number' ? n.height : 0);

    if (!useGroups) {
        return {
            id: 'elk-root',
            layoutOptions: rootLayoutOptions(elkMainDir),
            children: nodes.map((n) => ({
                id: n.id,
                width: w(n),
                height: h(n),
            })),
            edges: edges.map(toElkEdge),
        };
    }

    const initialIds = new Set(initial.map((n) => n.id));
    const { internalInitial, internalExpanded, cross } = partitionEdges(edges, initialIds);

    return {
        id: 'elk-root',
        layoutOptions: rootLayoutOptions(elkMainDir),
        children: [
            {
                id: 'elk-group-initial',
                layoutOptions: groupLayoutOptions(siblingDir),
                children: initial.map((n) => ({
                    id: n.id,
                    width: w(n),
                    height: h(n),
                })),
                edges: internalInitial.map(toElkEdge),
            },
            {
                id: 'elk-group-expanded',
                layoutOptions: groupLayoutOptions(siblingDir),
                children: expanded.map((n) => ({
                    id: n.id,
                    width: w(n),
                    height: h(n),
                })),
                edges: internalExpanded.map(toElkEdge),
            },
        ],
        edges: cross.map(toElkEdge),
    };
}

export async function layoutSpeciesFlowHierarchic(
    nodes: Node[],
    edges: Edge[],
    dims: SpeciesFlowLayoutDims,
    direction: 'TB' | 'LR'
): Promise<Node[]> {
    const withDims = nodes.map((n) => ({
        ...n,
        width: dims.nodeWidth,
        height: dims.nodeHeight,
    }));

    const graph = buildElkGraph(withDims, edges, direction);
    const layoutedGraph = await elk.layout(graph);

    const leafIds = new Set(withDims.map((n) => n.id));
    const pos = new Map<string, { x: number; y: number }>();
    collectAbsolutePositions(layoutedGraph, 0, 0, leafIds, pos);

    return withDims.map((n) => {
        const p = pos.get(n.id);
        return {
            ...n,
            position: p ?? n.position,
        };
    });
}
