import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    SET_MESSAGE,
} from "./types.action";

import AuthService from "../services/auth.service";
import openNotification from "../components/Animations/notification";

export const login = (username, password) => (dispatch) => {
    return AuthService.login(username, password)
        .then((data) => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: {user: data},
            });
            return Promise.resolve();
        },
        (error) => {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();
            dispatch({
                type: LOGIN_FAIL,
            });
            dispatch({
                type: SET_MESSAGE,
                payload: message,
            });
            return Promise.reject();
        }
    );
};

export const logout = () => (dispatch) => {
    AuthService.logout()
        .then(() => {
            openNotification("success", "Success", "Successful Logout")
        })
    dispatch({
        type: LOGOUT
    });
};