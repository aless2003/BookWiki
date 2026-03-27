use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct SidecarState(Mutex<Option<CommandChild>>);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(SidecarState(Mutex::new(None)))
        .setup(|app| {
            let shell = app.shell();
            let sidecar_command = shell.sidecar("bookwiki-backend").unwrap();
            let (_, child) = sidecar_command.spawn().expect("Failed to spawn sidecar");

            let state = app.state::<SidecarState>();
            let mut lock = state.0.lock().unwrap();
            *lock = Some(child);

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| match event {
            tauri::RunEvent::Exit => {
                let state = app_handle.state::<SidecarState>();
                let maybe_child = {
                    let mut lock = state.0.lock().unwrap();
                    lock.take()
                };

                if let Some(child) = maybe_child {
                    let _ = child.kill();
                }
            }
            _ => {}
        });
}
