import axios from "axios";
import {api_url} from "../api_url";

const API_URL = api_url;

class DispatcherService {

    addNewDispatcher(username, email, password) {
        return axios.post(API_URL + "user-management/addNewDispatcher", {
            username,
            email,
            password
        }, {withCredentials: true});
    }
}

export default new DispatcherService();