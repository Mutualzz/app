mod json;

pub use json::{json_to_term, term_to_json};

use std::io::Cursor;

use anyhow::Result;
use eetf::Term;
use serde_json::Value;

pub fn decode_etf_to_json(bytes: &[u8]) -> Result<Value> {
    let term = Term::decode(Cursor::new(bytes))?;
    Ok(term_to_json(&term))
}

pub fn encode_json_to_etf(value: &Value) -> Result<Vec<u8>> {
    let term: Term = json_to_term(value);
    let mut out = Vec::new();
    term.encode(&mut out)?;
    Ok(out)
}
