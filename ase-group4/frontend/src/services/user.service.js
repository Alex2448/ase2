import axios from 'axios';

import {api_url} from "../api_url";

const API_URL = api_url;

class UserService {
    getAllUser(page) {
        return axios.get(API_URL + "/delivery-api/user-management/getAllUser?page=" + page, {withCredentials: true});
    }

    getUsersByRole(role) {
        return axios.get(API_URL + "/delivery-api/user-management/getUsersByRole/" + role, {withCredentials: true});
    }

    registerNewUser(username, email, role, password) {
        return axios.post(API_URL + "/cas-api/user-management/addNewUser",  {
            username,
            email,
            role,
            password,
        }, {withCredentials: true})
    }

    addRfidToUser(userId, rfidToken) {
        return axios.post(API_URL + "/delivery-api/user-management/addRfidToUser", {
            userId: userId,
            rfidToken: rfidToken
        }, {withCredentials: true})
    }

    updateUser(updateUsername, newUsername, email, password, role) {
        return axios.post(API_URL + "/cas-api/user-management/updateUser/" + updateUsername,  {
            username: newUsername,
            email: email,
            password: password,
            role: role
        }, {withCredentials: true})
    }

    deleteUser(username) {
        return axios.delete(API_URL + "/cas-api/user-management/deleteUser/" + username, {withCredentials: true});
    }
}

export default new UserService();

