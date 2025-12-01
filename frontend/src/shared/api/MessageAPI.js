import AkramFitNetwork from "shared/config/httpConfig";

export default class MessageAPI {
    static async getMessages(project_id, chat_id) {
        const params = new URLSearchParams();
        const qs = params.toString();
        return await AkramFitNetwork.get(
            `projects/${project_id}/chats/${chat_id}/messages/${qs ? `?${qs}` : ""}`
        );
    }

    static async createMessage(project_id, chat_id, { text, user_id, parent_id, root_id }) {
        const payload = { text, user_id };
        if (parent_id !== undefined && parent_id !== null)
            payload.parent_id = parent_id;
        if (root_id !== undefined && root_id !== null)
            payload.root_id = root_id;
        return await AkramFitNetwork.post(
            `projects/${project_id}/chats/${chat_id}/messages/`,
            payload
        );
    }
}
