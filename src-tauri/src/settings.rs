use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentSettings {
    pub ai_model: String,
    pub effort_level: String,
    pub poll_interval_seconds: u32,
    pub max_concurrent_jobs: u32,
    pub simulated_failure_rate: f32,
    pub working_directory: String,
    pub launch_at_startup: bool,
}

impl Default for AgentSettings {
    fn default() -> Self {
        Self {
            ai_model: "nova-core".to_string(),
            effort_level: "medium".to_string(),
            poll_interval_seconds: 5,
            max_concurrent_jobs: 1,
            simulated_failure_rate: 0.15,
            working_directory: String::new(),
            launch_at_startup: false,
        }
    }
}

fn config_file_path() -> PathBuf {
    let base = dirs::config_dir().unwrap_or_else(std::env::temp_dir);
    base.join("AutomationAgentConsole").join("config.json")
}

fn load_from(path: &Path) -> AgentSettings {
    match fs::read_to_string(path) {
        Ok(raw) => serde_json::from_str(&raw).unwrap_or_default(),
        Err(_) => AgentSettings::default(),
    }
}

fn save_to(path: &Path, settings: &AgentSettings) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let contents = serde_json::to_string_pretty(settings).map_err(|e| e.to_string())?;
    fs::write(path, contents).map_err(|e| e.to_string())
}

pub fn load() -> AgentSettings {
    load_from(&config_file_path())
}

pub fn save(settings: &AgentSettings) -> Result<(), String> {
    save_to(&config_file_path(), settings)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_config_path(test_name: &str) -> PathBuf {
        std::env::temp_dir().join(format!("automation-agent-console-test-{test_name}.json"))
    }

    #[test]
    fn load_returns_defaults_when_file_is_missing() {
        let path = temp_config_path("missing");
        let _ = fs::remove_file(&path);

        let settings = load_from(&path);

        assert_eq!(settings, AgentSettings::default());
    }

    #[test]
    fn save_then_load_round_trips_the_same_settings() {
        let path = temp_config_path("roundtrip");
        let settings = AgentSettings {
            ai_model: "nova-max".to_string(),
            effort_level: "high".to_string(),
            poll_interval_seconds: 12,
            max_concurrent_jobs: 4,
            simulated_failure_rate: 0.3,
            working_directory: "C:/demo".to_string(),
            launch_at_startup: true,
        };

        save_to(&path, &settings).expect("save should succeed");
        let loaded = load_from(&path);

        assert_eq!(loaded, settings);
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn load_falls_back_to_defaults_on_corrupted_file() {
        let path = temp_config_path("corrupted");
        fs::write(&path, "not valid json").expect("write should succeed");

        let settings = load_from(&path);

        assert_eq!(settings, AgentSettings::default());
        let _ = fs::remove_file(&path);
    }
}
