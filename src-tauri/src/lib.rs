use tauri::{AppHandle, Manager, RunEvent};
#[cfg(desktop)]
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_log::{Target, TargetKind, WEBVIEW_TARGET};
use tauri_plugin_notification::NotificationExt;

#[cfg(desktop)]
mod tray;
mod updater;



#[tauri::command]
fn close_splashscreen(
    app: AppHandle,
) {
    #[cfg(desktop)]
    {
        let splash_window = app.get_webview_window("splashscreen").unwrap();
        let main_window = app.get_webview_window("main").unwrap();

        if splash_window.is_visible().unwrap() {
            splash_window.hide().unwrap();
            splash_window.close().unwrap();
        }
        if !main_window.is_visible().unwrap() {
            main_window.show().unwrap();
        }
    }
}

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
                        app.notification()
                            .builder()
                            .title("This app is already running!")
                            .body("You can find it in the tray menu.")
                            .show()
                            .unwrap();
                    }));

                let _ = app_handle.plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec![]),
                ));

                // Tray
                let handle = app.handle();
                tray::create_tray(handle)?;
            }

            // Open the dev tools automatically when debugging the application
            #[cfg(debug_assertions)]
            if let Some(main_window) = app.get_webview_window("main") {
                main_window.open_devtools();
            };

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            updater::check_for_updates,
            updater::download_update,
            updater::install_update,
            updater::clear_update_cache
        ])
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
        RunEvent::ExitRequested { api, code, .. } => {
            // Keep the event loop running even if all windows are closed
            // This allow us to catch tray icon events when there is no window
            // if we manually requested an exit (code is Some(_)) we will let it go through
            if code.is_none() {
                api.prevent_exit();
            }
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