use serde::Serialize;
use sysinfo::System;

#[derive(Serialize)]
pub struct RunningProcess {
    pub pid: u32,
    pub name: String,
}

#[tauri::command]
pub fn list_processes() -> Vec<RunningProcess> {
    let mut system = System::new_all();
    system.refresh_processes();

    let mut out: Vec<RunningProcess> = Vec::new();

    for (pid, process) in system.processes() {
        out.push(RunningProcess {
            pid: pid.as_u32(),
            name: process.name().to_string(),
        });
    }

    out
}
