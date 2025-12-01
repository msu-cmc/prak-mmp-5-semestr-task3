import AkramFitNetwork from "shared/config/httpConfig";

export default class ChatAPI {
    static async getChats(project_id, name = "") {
        const params = new URLSearchParams();
        if (name)
            params.append("name", name);
        const qs = params.toString();
        return await AkramFitNetwork.get(`projects/${project_id}/chats/${qs ? `?${qs}` : ""}`);
    }

    static async createChat(project_id, { name }) {
        return await AkramFitNetwork.post(`projects/${project_id}/chats/`, { name });
    }

    static async getChat(project_id, chat_id) {
        return await AkramFitNetwork.get(`projects/${project_id}/chats/${chat_id}`);
    }

    static async updateChat(project_id, chat_id, { name }) {
        return await AkramFitNetwork.put(`projects/${project_id}/chats/${chat_id}`, { name });
    }

    static async deleteChat(project_id, chat_id) {
        return await AkramFitNetwork.delete(`projects/${project_id}/chats/${chat_id}`);
    }
}
