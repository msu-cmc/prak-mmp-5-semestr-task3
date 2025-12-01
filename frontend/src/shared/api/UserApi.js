import AkramFitNetwork from "shared/config/httpConfig";

export default class UserApi {
    static async createUser(data) {
        return await AkramFitNetwork.post("users/", {
            email: data.email,
            password: data.password,
            role: data.role,
            fio: data.fio,
        })
    }

    static async updateUser(data) {
        const payload = {
            email: data.email,
            fio:   data.fio,
            role:  data.role,
        };

        if (data.password) {
            payload.password = data.password;
        }

        return await AkramFitNetwork.put(`users/${data.id}`, payload);
    }

    static async deleteUser(id) {
        return await AkramFitNetwork.delete(`users/${id}`)
    }

    static async getUser(id) {
        return await AkramFitNetwork.get(`users/${id}`)
    }
    
    static async getUsers(query = "", role = "") {
        const params = new URLSearchParams();
        if (query)
            params.append("query", query);
        if (role)
            params.append("role", role);
        const queryString = params.toString();
        return await AkramFitNetwork.get(`users${queryString ? `?${queryString}` : ""}`);
    }
}
