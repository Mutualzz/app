use tauri::{Manager, RunEvent};
#[cfg(desktop)]
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{Target, TargetKind, WEBVIEW_TARGET};
use tauri_plugin_notification;



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    unsafe {
        std::env::set_var("RUST_BACKTRACE", "1");
        std::env::set_var("RUST_LOG", "debug");
    }

    let context = tauri::generate_context!();

    // let config = context.config_mut();

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .clear_targets()
                .targets([
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir {
                        file_name: Some("webview".into()),
                    })
                    .filter(|metadata| metadata.target() == WEBVIEW_TARGET),
                    Target::new(TargetKind::LogDir {
                        file_name: Some("rust".into()),
                    })
                    .filter(|metadata| metadata.target() != WEBVIEW_TARGET),
                ])
                .format(move |out, message, record| {
                    out.finish(format_args!(
                        "{} [{}] {}",
                        chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                        record.level(),
                        message
                    ));
                })
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .setup(move |app| {
            let app_handle = app.handle();

            #[cfg(desktop)]
            {
                app_handle.plugin(tauri_plugin_updater::Builder::new().build())?;
                let _ =
                    app_handle.plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
                        app.get_webview_window("main")
                            .map(|window| {
                                window.show().unwrap();
                                window.set_focus().unwrap();
                            })
                            .unwrap_or_else(|| {
                                eprintln!("Failed to focus the main window");
                            });
                        ();
                    }));

                let _ = app_handle.plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec![]),
                ));
            }

            // Open the dev tools automatically when debugging the application
            #[cfg(debug_assertions)]
            if let Some(main_window) = app.get_webview_window("main") {
                main_window.open_devtools();
            };

            Ok(())
        })
        .build(context)
        .expect("error while running tauri application");

    #[cfg(desktop)]
    app.run(|app, e| match e {
        RunEvent::Ready => {
            #[cfg(any(target_os = "macos", debug_assertions))]
            let window = app.get_webview_window("main").unwrap();

            #[cfg(debug_assertions)]
            window.open_devtools();

            println!("App is ready");
        }
        tauri::RunEvent::WindowEvent {
            label,
            event: tauri::WindowEvent::CloseRequested { api, .. },
            ..
        } => {
            #[cfg(target_os = "macos")]
            {
                tauri::AppHandle::hide(&app.app_handle()).unwrap();
            }
            #[cfg(not(target_os = "macos"))]
            {
                let window = app.get_webview_window(label.as_str()).unwrap();
                window.hide().unwrap();
            }
            api.prevent_close();
        }
        _ => {}
    });

    #[cfg(mobile)]
    app.run(|app, e| match e {
        RunEvent::Ready => {
            println!("App is ready");
        }
        _ => {}
    });
}