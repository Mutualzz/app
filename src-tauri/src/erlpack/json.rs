use std::collections::HashMap;

use eetf::{
    Atom, BigInteger, Binary, BitBinary, ByteList, FixInteger, Float, ImproperList, List, Map,
    Term, Tuple,
};
use num_bigint::BigInt;
use serde_json::{Map as JsonMap, Number, Value};

fn binary_like_to_json(bytes: &[u8]) -> Value {
    match std::str::from_utf8(bytes) {
        Ok(s) => Value::String(s.to_owned()),
        Err(_) => Value::Array(
            bytes
                .iter()
                .map(|b| Value::Number(Number::from(*b)))
                .collect(),
        ),
    }
}

pub fn term_to_json(term: &Term) -> Value {
    match term {
        Term::Atom(Atom { name }) => match name.as_str() {
            "nil" | "null" => Value::Null,
            "true" => Value::Bool(true),
            "false" => Value::Bool(false),

            "undefined" => Value::Null,

            _ => Value::String(name.clone()),
        },

        Term::FixInteger(FixInteger { value }) => Value::Number(Number::from(*value)),

        Term::BigInteger(BigInteger { value }) => Value::String(value.to_string()),

        Term::Float(Float { value }) => Number::from_f64(*value)
            .map(Value::Number)
            .unwrap_or(Value::Null),

        Term::Binary(Binary { bytes }) => binary_like_to_json(bytes),
        Term::BitBinary(BitBinary { bytes, .. }) => binary_like_to_json(bytes),

        Term::ByteList(ByteList { bytes }) => binary_like_to_json(bytes),

        Term::List(List { elements }) => Value::Array(elements.iter().map(term_to_json).collect()),

        Term::ImproperList(ImproperList { elements, last }) => {
            let mut out: Vec<Value> = elements.iter().map(term_to_json).collect();
            out.push(term_to_json(last));
            Value::Array(out)
        }

        Term::Tuple(Tuple { elements }) => {
            Value::Array(elements.iter().map(term_to_json).collect())
        }

        Term::Map(Map { map }) => {
            let mut obj: JsonMap<String, Value> = JsonMap::new();
            for (k, v) in map {
                let key = term_to_string_key(k);
                obj.insert(key, term_to_json(v));
            }
            Value::Object(obj)
        }

        Term::Pid(pid) => Value::String(format!("{pid}")),
        Term::Port(port) => Value::String(format!("{port}")),
        Term::Reference(r) => Value::String(format!("{r}")),
        Term::ExternalFun(fun) => Value::String(format!("{fun}")),
        Term::InternalFun(fun) => Value::String(format!("{fun}")),
    }
}

fn term_to_string_key(term: &Term) -> String {
    match term {
        Term::Atom(Atom { name }) => name.clone(),
        Term::FixInteger(FixInteger { value }) => value.to_string(),
        Term::BigInteger(BigInteger { value }) => value.to_string(),
        Term::ByteList(ByteList { bytes }) => String::from_utf8_lossy(bytes).into_owned(),
        Term::Binary(Binary { bytes }) => match std::str::from_utf8(bytes) {
            Ok(s) => s.to_owned(),
            Err(_) => base64::encode(bytes),
        },

        _ => serde_json::to_string(&term_to_json(term)).unwrap_or_else(|_| "<key>".into()),
    }
}

pub fn json_to_term(value: &Value) -> Term {
    match value {
        Value::Null => Term::Binary(Binary {
            bytes: b"null".to_vec(),
        }),

        Value::Bool(b) => Term::Binary(Binary {
            bytes: if *b {
                b"true".to_vec()
            } else {
                b"false".to_vec()
            },
        }),

        Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                if i >= i32::MIN as i64 && i <= i32::MAX as i64 {
                    return Term::FixInteger(FixInteger { value: i as i32 });
                }

                return Term::BigInteger(BigInteger {
                    value: BigInt::from(i),
                });
            }

            if let Some(f) = n.as_f64() {
                return Term::Float(Float { value: f });
            }

            Term::Binary(Binary {
                bytes: n.to_string().into_bytes(),
            })
        }

        Value::String(s) => Term::Binary(Binary {
            bytes: s.clone().into_bytes(),
        }),

        Value::Array(arr) => {
            let elements = arr.iter().map(json_to_term).collect();
            Term::List(List { elements })
        }

        Value::Object(obj) => {
            let mut map: HashMap<Term, Term> = HashMap::new();
            for (k, v) in obj {
                let key_term = Term::Binary(Binary {
                    bytes: k.clone().into_bytes(),
                });
                let val_term = json_to_term(v);
                map.insert(key_term, val_term);
            }
            Term::Map(Map { map })
        }
    }
}
