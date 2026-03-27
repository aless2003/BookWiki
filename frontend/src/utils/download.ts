import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

interface FileFilter {
  name: string;
  extensions: string[];
}

/**
 * Downloads a file to a specific location chosen by the user.
 * Handles both Tauri (desktop) and Web browser environments.
 * 
 * @param data The data to be saved (Blob or Uint8Array)
 * @param filename Suggested name for the file
 * @param filters Optional file type filters
 */
export async function downloadFile(
  data: Blob | Uint8Array, 
  filename: string, 
  filters?: FileFilter[]
): Promise<void> {
  // Check if running in Tauri environment
  const isTauri = !!(window as any).__TAURI_INTERNALS__;

  if (isTauri) {
    try {
      const path = await save({
        defaultPath: filename,
        filters: filters,
      });

      if (path) {
        const buffer = data instanceof Blob 
          ? new Uint8Array(await data.arrayBuffer()) 
          : data;
        
        await writeFile(path, buffer);
        console.log(`File saved successfully to ${path}`);
      }
    } catch (error) {
      console.error('Tauri save error:', error);
      throw error;
    }
  } else {
    // Web Browser implementation
    try {
      // Try to use the modern File System Access API
      if ('showSaveFilePicker' in window) {
        // Map common extensions to MIME types for the web API
        const mimeMap: Record<string, string> = {
          'pdf': 'application/pdf',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'bwiki': 'application/json', // Or whatever BookWiki uses
          'txt': 'text/plain',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
        };

        const types = filters?.map(f => ({
          description: f.name,
          accept: f.extensions.reduce((acc, ext) => {
            const mime = mimeMap[ext.toLowerCase()] || 'application/octet-stream';
            acc[mime] = [`.${ext}`];
            return acc;
          }, {} as Record<string, string[]>)
        }));

        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: types,
        });
        
        const writable = await handle.createWritable();
        await writable.write(data);
        await writable.close();
        console.log('File saved via File System Access API');
      } else {
        // Fallback to standard <a> tag download
        const blob = data instanceof Blob ? data : new Blob([data as any]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        // Revoke after a delay to ensure the download started
        setTimeout(() => URL.revokeObjectURL(url), 100);
        console.log('File download triggered via fallback method');
      }
    } catch (error: any) {
      // showSaveFilePicker throws AbortError if user cancels, which we can ignore
      if (error.name === 'AbortError') {
        console.log('User cancelled the save dialog');
        return;
      }
      
      console.error('Web save error:', error);
      
      // Secondary fallback if showSaveFilePicker failed for some other reason
      const blob = data instanceof Blob ? data : new Blob([data as any]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
}
