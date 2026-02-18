import { API_BASE_URL } from './api';
export { API_BASE_URL };

export const resolveShortcodes = (text: string | null | undefined): string => {
    if (!text) return '';
    
    // Resolve #{image:uuid} to /api/media/uuid
    return text.replace(/#\{image:([\w\-]+)\}/g, (_match, uuid) => {
        return `${API_BASE_URL}/api/media/${uuid}`;
    });
};

export const toShortcode = (uuid: string): string => {
    return `#{image:${uuid}}`;
};
