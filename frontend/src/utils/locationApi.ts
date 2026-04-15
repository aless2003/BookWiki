export interface LocationTreeNode {
    id: number;
    name: string;
    pictureUrl: string;
    areaPercentage?: number;
    children: LocationTreeNode[];
}

export interface LocationTaxonomy {
    parentNode: LocationTreeNode | null;
    targetNode: LocationTreeNode;
}

export interface LocationLink {
    id?: number;
    sourceLocationId: number;
    targetLocationId: number;
    label: string;
    isBidirectional: boolean;
}

export interface LocationFlow {
    nodes: LocationTreeNode[];
    edges: LocationLink[];
}

export const fetchLocationTaxonomy = async (id: number): Promise<LocationTaxonomy> => {
    const res = await fetch(`http://localhost:3906/api/locations/${id}/taxonomy`);
    if (!res.ok) throw new Error('Failed to fetch location taxonomy');
    return res.json();
};

export const fetchLocationFlow = async (ids: number[]): Promise<LocationFlow> => {
    const res = await fetch(`http://localhost:3906/api/locations/flow?ids=${ids.join(',')}`);
    if (!res.ok) throw new Error('Failed to fetch location flow');
    return res.json();
};

export const createLocationLink = async (link: LocationLink): Promise<LocationLink> => {
    const res = await fetch(`http://localhost:3906/api/locations/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link)
    });
    if (!res.ok) throw new Error('Failed to create location link');
    return res.json();
};

export const deleteLocationLink = async (id: number): Promise<void> => {
    const res = await fetch(`http://localhost:3906/api/locations/links/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete location link');
};
