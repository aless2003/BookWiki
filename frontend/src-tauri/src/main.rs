use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandChild;
use tauri::Manager;
use std::sync::Mutex;

struct SidecarState(Mutex<Option<CommandChild>>);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            let shell = app.shell();
            let sidecar_command = shell.sidecar("bookwiki-backend").unwrap();
            let (_rx, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

            let state = app.state::<SidecarState>();
            let mut lock = state.0.lock().unwrap();
            *lock = Some(child);

            Ok(())
        })
        .on_window_event(|app, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let state = app.state::<SidecarState>();
                let maybe_child = {
                    let mut lock = state.0.lock().unwrap();
                    lock.take()
                };
                
                if let Some(child) = maybe_child {
                    let _ = child.kill();
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
