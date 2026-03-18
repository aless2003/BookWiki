import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export const WindowService = {
  openWindow: async (path: string, label: string, title?: string) => {
    // Check if window already exists (by label) to avoid errors, or just try catch
    try {
      const webview = new WebviewWindow(label, {
        url: path,
        title: title || 'BookWiki',
        width: 1024,
        height: 768,
      });

      webview.once('tauri://created', function () {
        console.log(`Window ${label} created successfully.`);
      });

      webview.once('tauri://error', function (e) {
        console.error(`Error creating window ${label}:`, e);
      });
    } catch (err) {
      console.error('Failed to create window:', err);
    }
  }
};
