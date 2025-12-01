export default class PhotosApi {
    static async uploadPhoto(url, file) {
        const response = await fetch(url, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type,
            },
        });
        if (!response.ok) {
            throw new Error("Upload failed");
        }

        return response;
    }
}
