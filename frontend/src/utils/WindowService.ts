import { WebviewWindow } from '@tauri-apps/api/webviewWindow';

export const WindowService = {
  openWindow: async (path: string, label: string, title?: string) => {
    // Check if running in browser
    if (!(window as any).__TAURI_INTERNALS__) {
       alert("Window creation is only supported in the desktop app, not in the browser.");
       return;
    }

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
        alert(`Error creating window: ${JSON.stringify(e)}`);
      });
    } catch (err) {
      console.error('Failed to create window:', err);
      alert(`Failed to create window: ${err}`);
    }
  }
};
