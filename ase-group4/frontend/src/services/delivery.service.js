import axios from 'axios';
import {api_url} from "../api_url";

const API_URL = api_url;

class DeliveryService {

    getAllDeliveries(page) {
        return axios.get(API_URL + "/delivery-api/deliveries/getAllDeliveries?page=" + page, {withCredentials: true});
    }

    getDeliveriesByUser(customerName, status, page, searchParam) {
        return axios.get(API_URL + "/delivery-api/deliveries/getDeliveries/"
            + customerName + "/" + status
            + "?page=" + page
            + "&searchParam=" + searchParam,
            {withCredentials: true});
    }

    getAllActiveDeliveriesByUser(customerName, page, searchParam) {
        return axios.get(API_URL + "/delivery-api/deliveries/getActiveDeliveries/"
            + customerName
            + "?page=" + page
            + "&searchParam=" + searchParam,
            {withCredentials: true});
    }

    deleteDelivery(deliveryId) {
        return axios.delete(API_URL + "/delivery-api/deliveries/deleteDelivery/" + deliveryId, {withCredentials: true});
    }

    addNewDelivery(customerId, delivererId, targetBoxId) {
        return axios.post(API_URL + "/delivery-api/deliveries/addNewDelivery", {
            customerId,
            delivererId,
            targetBoxId
        }, {withCredentials: true})
    }

    changeDeliveryStatus = (deliveryId, status) => {
        return axios.post(API_URL + "/delivery-api/deliveries/changeStatus/" + deliveryId + "?status=" + status, {}, {withCredentials: true})
    }

    updateDelivery = (deliveryId, customerId, delivererId, targetBoxId) => {
        return axios.post(API_URL + "/delivery-api/deliveries/updateDelivery/" + deliveryId, {
            customerId,
            delivererId,
            targetBoxId
        }, {withCredentials: true})
    }

    updateDeliveryStatus = (deliveryId, status) => {
        return axios.post(API_URL + "/delivery-api/deliveries/changeStatus/"+ deliveryId + "?status=" + status, {}, {withCredentials: true})
    }
}

export default new DeliveryService();