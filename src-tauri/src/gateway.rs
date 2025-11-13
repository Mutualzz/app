use serde::Deserialize;
use serde_json::Value;

use crate::erlpack::{decode_etf_to_json, encode_json_to_etf};

#[derive(Debug, Clone, Copy, Deserialize, serde::Serialize)]
#[serde(rename_all = "kebab-case")]
pub enum Encoding {
    Json,
    Etf,
}

pub fn decode_frame(payload: Vec<u8>, encoding: Encoding) -> anyhow::Result<Value> {
    match encoding {
        Encoding::Json => {
            let v: Value = serde_json::from_slice(&payload)?;
            Ok(v)
        }
        Encoding::Etf => decode_etf_to_json(&payload),
    }
}

pub fn encode_frame(payload: &Value, encoding: Encoding) -> anyhow::Result<Vec<u8>> {
    match encoding {
        Encoding::Json => Ok(serde_json::to_vec(payload)?),
        Encoding::Etf => encode_json_to_etf(payload),
    }
}
