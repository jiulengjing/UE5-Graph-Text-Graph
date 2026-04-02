use axum::{
    extract::State,
    http::{header, StatusCode},
    response::{sse::{Event, Sse}, IntoResponse},
    routing::{get, post},
    Json, Router,
};
use mime_guess::from_path;
use rust_embed::Embed;
use serde_json::Value;
use std::{
    convert::Infallible,
    sync::Arc,
    time::Duration,
};
use tokio::sync::{broadcast, Mutex};
use tokio::net::TcpListener;
use tokio_stream::wrappers::BroadcastStream;
use tokio_stream::StreamExt as _;

// Embed the built frontend (dist/) into the binary at compile time
#[derive(Embed)]
#[folder = "../dist"]
struct FrontendAssets;

/// Shared application state
#[derive(Clone)]
struct AppState {
    /// SSE broadcast channel — sends JSON strings to all connected browsers
    tx: broadcast::Sender<String>,
    /// Latest payload in memory (for /api/latest and new SSE subscribers)
    latest: Arc<Mutex<Option<Value>>>,
}

// ──────────────────────────────────────────────
// Route handlers
// ──────────────────────────────────────────────

/// POST /api/render  — receive blueprint JSON from LLM/tools
async fn render_handler(State(state): State<AppState>, Json(payload): Json<Value>) {
    // 1. Persist latest
    *state.latest.lock().await = Some(payload.clone());

    // 2. Broadcast to all SSE listeners (ignore "no receivers" error)
    let _ = state.tx.send(payload.to_string());

    // 3. Open Chrome (Windows-first, then system default) to show the board
    open_browser("http://localhost:14178");
}

/// GET /api/latest  — one-shot fetch of current payload (used on page load)
async fn latest_handler(State(state): State<AppState>) -> impl IntoResponse {
    let guard = state.latest.lock().await;
    match &*guard {
        Some(v) => Json(v.clone()).into_response(),
        None => (StatusCode::NO_CONTENT, "").into_response(),
    }
}

/// GET /api/sse  — Server-Sent Events stream
async fn sse_handler(State(state): State<AppState>) -> Sse<impl tokio_stream::Stream<Item = Result<Event, Infallible>>> {
    let rx = state.tx.subscribe();
    let stream = BroadcastStream::new(rx)
        .filter_map(|result: Result<String, _>| {
            result.ok().map(|data| {
                Ok::<Event, Infallible>(Event::default().event("update").data(data))
            })
        });

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    )
}

/// GET /*  — serve embedded static frontend assets
async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/');
    let path = if path.is_empty() { "index.html" } else { path };

    match FrontendAssets::get(path) {
        Some(content) => {
            let mime = from_path(path).first_or_octet_stream();
            (
                StatusCode::OK,
                [(header::CONTENT_TYPE, mime.as_ref().to_string())],
                content.data.into_owned(),
            )
                .into_response()
        }
        None => {
            // SPA fallback: serve index.html for any unknown path
            match FrontendAssets::get("index.html") {
                Some(content) => (
                    StatusCode::OK,
                    [(header::CONTENT_TYPE, "text/html".to_string())],
                    content.data.into_owned(),
                )
                    .into_response(),
                None => (StatusCode::NOT_FOUND, "Not Found").into_response(),
            }
        }
    }
}

// ──────────────────────────────────────────────
// Browser opener — Windows Chrome first, then fallback
// ──────────────────────────────────────────────

fn open_browser(url: &str) {
    let url = url.to_string();

    // Try Chrome on Windows first
    #[cfg(target_os = "windows")]
    {
        // Common Chrome paths on Windows
        let chrome_paths = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        ];
        for path in &chrome_paths {
            if std::path::Path::new(path).exists() {
                let _ = std::process::Command::new(path)
                    .arg("--new-window")
                    .arg(&url)
                    .spawn();
                return;
            }
        }
        // Fallback: use Windows 'start' command (opens default browser)
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn();
    }

    // macOS / Linux fallback
    #[cfg(not(target_os = "windows"))]
    {
        #[cfg(target_os = "macos")]
        let _ = std::process::Command::new("open").arg(&url).spawn();
        #[cfg(target_os = "linux")]
        let _ = std::process::Command::new("xdg-open").arg(&url).spawn();
    }
}

// ──────────────────────────────────────────────
// Tauri app entry point
// ──────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let (tx, _) = broadcast::channel::<String>(32);
    let state = AppState {
        tx,
        latest: Arc::new(Mutex::new(None)),
    };

    let state_clone = state.clone();

    tauri::Builder::default()
        .setup(move |_app| {
            // Spawn the HTTP server in a background task
            let srv_state = state_clone.clone();
            tauri::async_runtime::spawn(async move {
                let router = Router::new()
                    .route("/api/render", post(render_handler))
                    .route("/api/latest", get(latest_handler))
                    .route("/api/sse",    get(sse_handler))
                    .fallback(static_handler)
                    .with_state(srv_state);

                match TcpListener::bind("127.0.0.1:14178").await {
                    Ok(listener) => {
                        eprintln!("[Json2Board] HTTP server listening on http://127.0.0.1:14178");
                        let _ = axum::serve(listener, router).await;
                    }
                    Err(e) => {
                        eprintln!("[Json2Board] Failed to bind port 14178: {e}");
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
