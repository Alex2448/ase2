import axios from 'axios';
import {api_url} from "../api_url";

const API_URL = api_url;

class BoxService {
    getAllBoxes(page) {
        return axios.get(API_URL + "/delivery-api/boxes/getAllBoxes?page=" + page, {withCredentials: true});
    }

    getAvailableBoxes() {
        return axios.get(API_URL + "/delivery-api/boxes/getAvailableBoxes", {withCredentials: true});
    }

    registerNewBox(raspberryId, name, street, postcode, state, city, country) {
        return axios.post(API_URL + "/delivery-api/boxes/registerNewBox",  {
            raspberryId,
            name,
            street,
            postcode,
            state,
            city,
            country
        }, {withCredentials: true})
    }

    updateBox(id, name, street, postcode, state, city, country) {
        return axios.post(API_URL + "/delivery-api/boxes/updateBox/" + id,  {
            name,
            street,
            postcode,
            state,
            city,
            country
        }, {withCredentials: true})
    }

    deleteBox(id) {
        return axios.delete(API_URL + "/delivery-api/boxes/deleteBox/" + id, {withCredentials: true});
    }
}

export default new BoxService();
