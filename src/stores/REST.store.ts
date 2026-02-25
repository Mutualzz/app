import { Logger } from "@mutualzz/logger";
import { HttpStatusCode } from "@mutualzz/types";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { normalizeJSON } from "@utils/JSON";
import EventEmitter from "events";
import { detectBrowser, detectOS } from "../utils/detect";

let isTauri: boolean;
let os: string;
let client: string;

try {
    getCurrentWindow();
    isTauri = true;
    os = await detectOS();
    client = "Mutualzz Client";
} catch {
    isTauri = false;
    os = await detectOS();
    client = detectBrowser();
}

const clientMeta = {
    type: isTauri ? "Desktop" : "Browser",
    os,
    client,
};

const DEFAULT_HEADERS = {
    accept: "application/json",

    "X-Mutualzz-Client": clientMeta.client,
    "X-Mutualzz-Client-OS": clientMeta.os,
    "X-Mutualzz-Client-Type": clientMeta.type,
};

export class REST extends EventEmitter {
    private readonly logger = new Logger({
        tag: "REST",
    });
    private headers: Record<string, string>;

    constructor() {
        super();
        this.headers = DEFAULT_HEADERS;
    }

    public static makeAPIUrl(
        path: string,
        queryParams: Record<string, any> = {},
    ) {
        const normalizedPath = path.replace(/\/{2,}/g, "/").replace(/^\/+/, "");
        const url = new URL(
            `${import.meta.env.VITE_API_URL}/v1/${normalizedPath}`,
        );
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    }

    public static makeCDNUrl(
        path: string,
        queryParams: Record<string, any> = {},
    ) {
        const normalizedPath = path.replace(/\/{2,}/g, "/").replace(/^\/+/, "");
        const url = new URL(
            `${import.meta.env.VITE_CDN_URL}/${normalizedPath}`,
        );
        Object.entries(queryParams).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return url.toString();
    }

    public setToken(token: string | null) {
        if (token) {
            this.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.headers.Authorization;
        }
    }

    public async get<Data>(
        path: string,
        queryParams: Record<string, any> = {},
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`GET ${url}`);

            return fetch(url, {
                method: "GET",
                headers: this.headers,
                mode: "cors",
            })
                .then(async (res) => {
                    if (res.status === HttpStatusCode.RateLimit) {
                        this.logger.warn("Rate limited on GET", url);
                        this.emit("rateLimited");
                    }

                    const data = normalizeJSON<Data>(await res.json());

                    if (!res.ok) return reject(data);

                    return resolve(data);
                })
                .catch(reject);
        });
    }

    public async post<Data = unknown, Body = unknown>(
        path: string,
        body?: Body,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`POST ${url}; payload:`, body);
            return fetch(url, {
                method: "POST",
                headers: {
                    ...headers,
                    ...this.headers,
                    "Content-Type": "application/json",
                },
                body: body ? JSON.stringify(body) : undefined,
                mode: "cors",
            })
                .then(async (res) => {
                    if (res.status === HttpStatusCode.RateLimit) {
                        this.logger.warn("Rate limited on POST", url);
                        this.emit("rateLimited");
                    }

                    const data = normalizeJSON<Data>(await res.json());

                    if (!res.ok) return reject(data);

                    return resolve(data);
                })
                .catch(reject);
        });
    }

    public async put<Data = unknown, Body = unknown>(
        path: string,
        body?: Body,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`PUT ${url}; payload:`, body);
            return fetch(url, {
                method: "PUT",
                headers: {
                    ...headers,
                    ...this.headers,
                    "Content-Type": "application/json",
                },
                body: body ? JSON.stringify(body) : undefined,
                mode: "cors",
            })
                .then(async (res) => {
                    if (res.status === HttpStatusCode.RateLimit) {
                        this.logger.warn("Rate limited on PUT", url);
                        this.emit("rateLimited");
                    }

                    const data = normalizeJSON<Data>(await res.json());

                    if (!res.ok) return reject(data);

                    return resolve(data);
                })
                .catch(reject);
        });
    }

    public async putFormData<Data>(
        path: string,
        body: FormData,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
        msg?: any,
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`PUT ${url}; payload:`, body);
            const xhr = new XMLHttpRequest();
            if (msg) {
                // add abort callback
                msg.setAbortCallback(() => {
                    this.logger.debug("[PutFormData]: Message called abort");
                    xhr.abort();
                    reject("aborted");
                });
                // add progress listener
                xhr.upload.addEventListener("progress", (e: ProgressEvent) =>
                    msg.updateProgress(e),
                );
            }

            xhr.addEventListener("loadend", () => {
                if (xhr.status === HttpStatusCode.RateLimit) {
                    this.logger.warn("Rate limited on PUT", url);
                    this.emit("rateLimited");
                }

                const data = JSON.parse(normalizeJSON(xhr.response));

                // if success, resolve text or json
                if (xhr.status >= 200 && xhr.status < 300) return resolve(data);

                return reject(data);
            });
            xhr.open("PUT", url);
            // set headers
            Object.entries({ ...headers, ...this.headers }).forEach(
                ([key, value]) => {
                    xhr.setRequestHeader(key, value);
                },
            );
            xhr.send(body);
        });
    }

    public async patch<Data = unknown, Body = unknown>(
        path: string,
        body?: Body,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`PATCH ${url}; payload:`, body);
            return fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...this.headers,
                    ...headers,
                },
                body: body ? JSON.stringify(body) : undefined,
                mode: "cors",
            })
                .then(async (res) => {
                    if (res.status === HttpStatusCode.RateLimit) {
                        this.logger.warn("Rate limited on PATCH", url);
                        this.emit("rateLimited");
                    }

                    const data = normalizeJSON<Data>(await res.json());

                    if (!res.ok) return reject(data);

                    return resolve(data);
                })
                .catch(reject);
        });
    }

    public async postFormData<Data>(
        path: string,
        body: FormData,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
        msg?: any,
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`POST ${url}; payload:`, body);
            const xhr = new XMLHttpRequest();
            if (msg) {
                // add abort callback
                msg.setAbortCallback(() => {
                    this.logger.debug("[PostFormData]: Message called abort");
                    xhr.abort();
                    reject("aborted");
                });
                // add progress listener
                xhr.upload.addEventListener("progress", (e: ProgressEvent) =>
                    msg.updateProgress(e),
                );
            }
            xhr.addEventListener("loadend", () => {
                if (xhr.status === HttpStatusCode.RateLimit) {
                    this.logger.warn("Rate limited on POST", url);
                    this.emit("rateLimited");
                }

                const data = JSON.parse(normalizeJSON(xhr.response));

                // if success, resolve text or json
                if (xhr.status >= 200 && xhr.status < 300) return resolve(data);

                return reject(data);
            });
            xhr.open("POST", url);
            // set headers
            Object.entries({ ...headers, ...this.headers }).forEach(
                ([key, value]) => {
                    xhr.setRequestHeader(key, value);
                },
            );
            xhr.send(body);
        });
    }

    public async patchFormData<Data>(
        path: string,
        body: FormData,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
        msg?: any,
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`PATCH ${url}; payload:`, body);
            const xhr = new XMLHttpRequest();
            if (msg) {
                // add abort callback
                msg.setAbortCallback(() => {
                    this.logger.debug("[PatchFormData]: Message called abort");
                    xhr.abort();
                    reject("aborted");
                });
                // add progress listener
                xhr.upload.addEventListener("progress", (e: ProgressEvent) =>
                    msg.updateProgress(e),
                );
            }
            xhr.addEventListener("loadend", () => {
                if (xhr.status === HttpStatusCode.RateLimit) {
                    this.logger.warn("Rate limited on PATCH", url);
                    this.emit("rateLimited");
                }

                const data = JSON.parse(normalizeJSON(xhr.response));

                // if success, resolve text or json
                if (xhr.status >= 200 && xhr.status < 300) return resolve(data);

                return reject(data);
            });
            xhr.open("PATCH", url);
            // set headers
            Object.entries({ ...headers, ...this.headers }).forEach(
                ([key, value]) => {
                    xhr.setRequestHeader(key, value);
                },
            );
            xhr.send(body);
        });
    }

    public async delete<Data>(
        path: string,
        queryParams: Record<string, any> = {},
        headers: Record<string, string> = {},
    ): Promise<Data> {
        return new Promise((resolve, reject) => {
            const url = REST.makeAPIUrl(path, queryParams);
            this.logger.debug(`DELETE ${url}`);
            return fetch(url, {
                method: "DELETE",
                headers: {
                    ...headers,
                    ...this.headers,
                },
                mode: "cors",
            })
                .then(async (res) => {
                    if (res.status === HttpStatusCode.RateLimit) {
                        this.logger.warn("Rate limited on DELETE", url);
                        this.emit("rateLimited");
                    }

                    const data = normalizeJSON<Data>(await res.json());

                    if (!res.ok) return reject(data);

                    return resolve(data);
                })
                .catch(reject);
        });
    }
}
