import axios from "axios";
import {api_url} from "../api_url";

const API_URL = api_url;

class AuthService {

    login(username, password)  {
        return axios.post(API_URL + "/cas-api/auth/signin", {username, password}, {withCredentials: true})
            .then((response) => {
                if (response.data.token) {
                    localStorage.setItem("user", JSON.stringify(response.data));
                }
                return response.data;
            });
    }

    logout() {
        localStorage.removeItem("user");
        return axios.post(API_URL + "/cas-api/auth/logout", {}, {withCredentials:true})
    }
}

export default new AuthService();