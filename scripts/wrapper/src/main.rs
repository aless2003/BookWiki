use std::process::Command;
use std::env;

fn main() {
    let exe_path = env::current_exe().expect("Failed to get current exe path");
    let app_dir = exe_path.parent().expect("Failed to get parent dir");
    
    let jre_path = app_dir.join("jre").join("bin").join("java.exe");
    let jar_path = app_dir.join("BookWiki-0.0.1-SNAPSHOT.jar");

    let args: Vec<String> = env::args().skip(1).collect();
    
    let mut cmd = Command::new(jre_path);
    cmd.arg("-jar").arg(jar_path);
    cmd.args(&args);
    cmd.arg("--spring.profiles.active=standalone");
    
    let mut child = cmd.spawn().expect("Failed to start backend process");
    let status = child.wait().expect("Failed to wait on child process");
    std::process::exit(status.code().unwrap_or(1));
}
