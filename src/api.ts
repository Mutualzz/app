import { getCurrentWindow } from "@tauri-apps/api/window";
import axios from "axios";
import { detectBrowser, detectOS } from "./utils";

let isTauri = false;
let os = "Other";
let client = "Unknown";
try {
    getCurrentWindow();
    isTauri = true;
    os = detectOS();
    client = "Mutualzz Client";
} catch {
    isTauri = false;
    os = detectOS();
    client = detectBrowser();
}

const clientMeta = {
    type: isTauri ? "Desktop" : "Browser",
    os,
    client,
};

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl + "/v1",
    headers: {
        "Content-Type": "application/json",
        "X-Client-Name": clientMeta.client,
        "X-Client-Type": clientMeta.type,
        "X-Client-OS": clientMeta.os,
    },
});

export { api };
