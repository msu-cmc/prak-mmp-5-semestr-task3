import AkramFitNetwork from "shared/config/httpConfig";

export default class AuthApi {
    static async login(email, password) {
        return await AkramFitNetwork.post("auth/login", {
            email: email,
            password: password
        })
    }
    static async sendCode(email) {
        return await AkramFitNetwork.post("auth/code/send", {
            email: email
        })
    }
    static async checkCode(email, code) {
        return await AkramFitNetwork.post("auth/code/check", {
            email: email,
            code: code
        })
    }
    static async resetPassword(email, password) {
        return await AkramFitNetwork.post("auth/password/reset", {
            email: email,
            password: password
        })
    }
    
}
