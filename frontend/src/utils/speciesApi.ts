import { API_BASE_URL } from '../constants/api';

export interface SpeciesLink {
    id?: number;
    sourceSpeciesId: number;
    targetSpeciesId: number;
    label: string;
    isBidirectional: boolean;
}

export interface SpeciesNode {
    id: number;
    name: string;
    pictureUrl?: string;
}

export interface SpeciesFlow {
    nodes: SpeciesNode[];
    edges: SpeciesLink[];
}

export const fetchSpeciesFlow = async (speciesIds: number[]): Promise<SpeciesFlow> => {
    const params = new URLSearchParams();
    speciesIds.forEach(id => params.append('ids', id.toString()));
    const response = await fetch(`${API_BASE_URL}/api/species/flow?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch species flow');
    }
    return response.json();
};

export const createSpeciesLink = async (link: SpeciesLink): Promise<SpeciesLink> => {
    const response = await fetch(`${API_BASE_URL}/api/species/links`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create species link');
    }
    return response.json();
};

export const deleteSpeciesLink = async (linkId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/species/links/${linkId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete species link');
    }
};
