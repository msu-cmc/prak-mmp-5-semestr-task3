import AkramFitNetwork from "shared/config/httpConfig";

export default class ProjectAPI {
    static async createProject({ name, file_name, ifc_file, hash }) {
        const form = new FormData();
        form.append("name", name);
        if (file_name)
            form.append("file_name", file_name);
        if (ifc_file)
            form.append("ifc_file", ifc_file);
        if (!ifc_file && hash)
            form.append("hash", hash);
        return await AkramFitNetwork.post("projects/", form, true);
    }

    static async getProjects(search = "") {
        const params = new URLSearchParams();
        if (search)
            params.append("search", search);
        const queryString = params.toString();
        return await AkramFitNetwork.get(`projects${queryString ? `?${queryString}` : ""}`);
    }

    static async getProject(project_id) {
        return await AkramFitNetwork.get(`projects/${project_id}`);
    }

    static async updateProject(project_id, { name }) {
        const payload = {};
        if (name !== undefined)
            payload.name = name;
        return await AkramFitNetwork.put(`projects/${project_id}`, payload);
    }

    static async deleteProject(project_id) {
        return await AkramFitNetwork.delete(`projects/${project_id}`);
    }

    static async listLibraryFiles(presign_ttl = 3600) {
        const params = new URLSearchParams();
        params.append("presign_ttl", String(presign_ttl));
        return await AkramFitNetwork.get(`projects/files?${params.toString()}`);
    }
}
