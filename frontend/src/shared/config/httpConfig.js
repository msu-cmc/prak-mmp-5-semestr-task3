import { TOKEN, USER, USER_ID, CURRENT_PATH, RECOVERY_EMAIL } from "shared/consts/localstorage";

class Network {
    constructor() {
        const baseURL = window.location.hostname === "localhost"
            ? "http://91.210.168.62/api/"
            : window.location.origin + "/api/";

        const token = sessionStorage.getItem(TOKEN);

        this.config = {
            baseURL,
            headers: {},
            token: token || "",
        };

        if (token) {
            this.config.headers.Authorization = "Bearer " + token;
        }

        this.updateToken        = this.updateToken.bind(this);
        this.handleUnauthorized = this.handleUnauthorized.bind(this);
        this.request            = this.request.bind(this);
        this.requestNoBody      = this.requestNoBody.bind(this);
        this.get                = this.get.bind(this);
        this.put                = this.put.bind(this);
        this.post               = this.post.bind(this);
        this.delete             = this.delete.bind(this);
        this.deleteNoBody       = this.deleteNoBody.bind(this);
    }

    updateToken(newToken) {
        this.config.token = newToken;
        if (newToken) {
            sessionStorage.setItem(TOKEN, newToken);
            this.config.headers.Authorization = "Bearer " + newToken;
        } else {
            sessionStorage.removeItem(TOKEN);
            delete this.config.headers.Authorization;
        }
    }

    handleUnauthorized() {
        // Очищаем токен и все данные пользователя
        this.updateToken(null);

        // Очищаем все данные авторизации из sessionStorage
        sessionStorage.removeItem(TOKEN);
        sessionStorage.removeItem(USER);
        sessionStorage.removeItem(USER_ID);
        sessionStorage.removeItem(CURRENT_PATH);
        sessionStorage.removeItem(RECOVERY_EMAIL);

        // Перенаправляем на страницу входа, если не на ней
        if (!window.location.pathname.includes("/auth") && !window.location.pathname.includes("/recovery")) {
            window.location.href = "/";
        }
    }

    createURL(url) {
        let newUrl = this.config.baseURL + url;
        return newUrl;
    }

    async request(url, method, body, file, signal = undefined) {
        let response;
        const headers = {};

        if (this.config.headers.Authorization) {
            headers.Authorization = this.config.headers.Authorization;
        }

        if (file) {
            response = await fetch(this.createURL(url), {
                method,
                body,
                headers,
                ...(signal && { signal: signal }),
            });
        } else {
            response = await fetch(this.createURL(url), {
                headers: {
                    ...headers,
                    "Content-Type": "application/json",
                },
                method,
                body: JSON.stringify(body),
                ...(signal && { signal: signal }),
            });
        }

        // Проверка на ошибки авторизации
        if (response.status === 401 || response.status === 403) {
            this.handleUnauthorized();
        }

        try {
            const data = await response.json();
            return {
                data,
                errors: !response.ok,
            };
        } catch (e) {
            throw "Что-то пошло не так";
        }
    }

    async requestNoBody(url, method, file, signal = undefined) {
        const headers = {};

        if (this.config.headers.Authorization) {
            headers.Authorization = this.config.headers.Authorization;
        }

        const response = await fetch(this.createURL(url), {
            headers,
            method,
            ...(signal && { signal: signal }),
        });

        // Проверка на ошибки авторизации
        if (response.status === 401 || response.status === 403) {
            this.handleUnauthorized();
        }

        if (file) {
            return response;
        }

        try {
            const data = await response.json();
            return {
                data,
                errors: !response.ok,
            };
        } catch (e) {
            throw "Что-то пошло не так";
        }
    }

    async getFile(url) {
        const headers = { "Content-Type": "application/json" };

        if (this.config.headers.Authorization) {
            headers.Authorization = this.config.headers.Authorization;
        }

        const response = await fetch(this.createURL(url), {
            headers,
            method: "GET",
        });
        try {
            const blob = await response.blob();

            return {
                data: { blob },
                errors: !response.ok,
            };
        } catch (e) {
            throw "Что-то пошло не так";
        }
    }

    async get(url, file = false, signal = undefined) {
        return await this.requestNoBody(url, "GET", file, signal);
    }

    async put(url, body) {
        return await this.request(url, "PUT", body);
    }

    async post(url, body, file = false) {
        return await this.request(url, "POST", body, file);
    }

    async delete(url, body) {
        return await this.request(url, "DELETE", body);
    }

    async deleteNoBody(url) {
        return await this.requestNoBody(url, "DELETE");
    }

    async getMinioFile(url) {
        if (!url) {
            return {
                errors: true,
                data: { detail: "URL пустой" }
            };
        }

        const resp = await fetch(url, { mode: "cors" });
        const type = resp.headers.get("content-type") || "";
        if (!resp.ok || !type.startsWith("image/")) {
            const detail = await resp.text();
            return {
                errors: true,
                data: { detail }
            };
        }

        const blob = await resp.blob();
        return {
            errors: false,
            data: { blob }
        };
    }
}

const AkramFitNetwork = new Network();

export default AkramFitNetwork;