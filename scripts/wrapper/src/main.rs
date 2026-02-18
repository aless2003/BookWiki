use std::process::{Command, Stdio};
use std::env;
use std::os::windows::io::AsRawHandle;
use winapi::um::jobapi2::{AssignProcessToJobObject, SetInformationJobObject};
use winapi::um::winnt::{
    JobObjectExtendedLimitInformation, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
    JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
};
use winapi::um::winbase::CreateJobObjectA;
use std::ptr::null_mut;
use std::mem::size_of;
use std::fs::File;

fn main() {
    let exe_path = env::current_exe().expect("Failed to get current exe path");
    let app_dir = exe_path.parent().expect("Failed to get parent dir");
    
    let mut jre_path = app_dir.join("jre").join("bin").join("java.exe");
    let mut jar_path = app_dir.join("BookWiki-0.0.1-SNAPSHOT.jar");

    if !jre_path.exists() {
        let tauri_resources = app_dir.join("_up_").join("_up_").join("scripts").join("dist");
        jre_path = tauri_resources.join("jre").join("bin").join("java.exe");
        jar_path = tauri_resources.join("BookWiki-0.0.1-SNAPSHOT.jar");
    }

    let args: Vec<String> = env::args().skip(1).collect();
    
    // Create job object for cleanup (ensures child process dies if this wrapper is killed)
    let job = unsafe { CreateJobObjectA(null_mut(), null_mut()) };
    if job != null_mut() {
        let mut info: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = unsafe { std::mem::zeroed() };
        info.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
        
        unsafe {
            SetInformationJobObject(
                job,
                JobObjectExtendedLimitInformation,
                &mut info as *mut _ as *mut _,
                size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
            );
        }
    }

    // Redirect logs for standalone debugging
    let log_file = File::create(app_dir.join("backend.log")).ok();
    let err_file = File::create(app_dir.join("backend.err")).ok();

    let mut cmd = Command::new(jre_path);
    cmd.arg("-Dbookwiki.standalone=true");
    cmd.arg("-jar").arg(jar_path);
    cmd.args(&args);
    cmd.arg("--spring.profiles.active=standalone");

    if let Some(f) = log_file {
        cmd.stdout(Stdio::from(f));
    }
    if let Some(f) = err_file {
        cmd.stderr(Stdio::from(f));
    }

    let mut child = cmd.spawn().expect("Failed to start backend process");

    if job != null_mut() {
        unsafe {
            AssignProcessToJobObject(job, child.as_raw_handle() as *mut _);
        }
    }

    let status = child.wait().expect("Failed to wait on child process");
    std::process::exit(status.code().unwrap_or(1));
}
