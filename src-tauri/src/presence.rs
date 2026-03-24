use serde::Serialize;
use sysinfo::System;

#[derive(Serialize)]
pub struct RunningProcess {
    pub pid: u32,
    pub name: String,
}

#[tauri::command]
pub fn list_processes(filter_exes: Option<Vec<String>>) -> Vec<RunningProcess> {
    let mut system = System::new_all();
    system.refresh_processes();

    let mut out: Vec<RunningProcess> = Vec::new();

    for (pid, process) in system.processes() {
        let process_name = process.name().to_string();

        // If filter is provided, only include matching processes
        if let Some(ref exes) = filter_exes {
            let name_lower = process_name.to_lowercase();
            if !exes.iter().any(|exe| exe.to_lowercase() == name_lower) {
                continue;
            }
        }

        out.push(RunningProcess {
            pid: pid.as_u32(),
            name: process_name,
        });
    }

    out
}
