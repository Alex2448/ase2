import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import DeliveryService from "../services/delivery.service";

const initialState = []

export const retrieveDeliveries = createAsyncThunk(
    "deliveries/retrieve",
    async ({page}) => {
        const response = await DeliveryService.getAllDeliveries(page);
        return response.data;
    }
)

export const createDelivery = createAsyncThunk(
    "deliveries/create",
    async ({customerId, delivererId, targetBoxId}) => {
        const response = await DeliveryService.addNewDelivery(customerId, delivererId, targetBoxId)
        return response.data
    }
)

export const updateDelivery = createAsyncThunk(
    "deliveries/update",
    async ({deliveryId, customerId, delivererId, targetBoxId}) => {
        const response = await DeliveryService.updateDelivery(deliveryId, customerId, delivererId, targetBoxId)
        return response.data
    }
)

export const updateDeliveryStatus = createAsyncThunk(
    "deliveries/updateStatus",
    async ({deliveryId, deliveryStatus}) => {
        const response = await DeliveryService.updateDeliveryStatus(deliveryId, deliveryStatus)
        return response.data
    }
)

export const deleteDelivery = createAsyncThunk(
    "deliveries/delete",
    async ({deliveryId}) => {
        await DeliveryService.deleteDelivery(deliveryId);
        return deliveryId
    }
)

const deliverySlice = createSlice({
    name: "deliveries",
    initialState,
    extraReducers: {
        [retrieveDeliveries.fulfilled]: (state, action) => {
            return [action.payload];
        },
        [createDelivery.fulfilled]: (state, action) => {
            // state.push(action.payload);
        },
        [updateDelivery.fulfilled]: (state, action) => {
            const index = state.findIndex(({id}) => id === action.payload.id);
            state[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [updateDeliveryStatus.fulfilled]: (state, action) => {
            const index = state.findIndex(({id}) => id === action.payload.id);
            state[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [deleteDelivery.fulfilled]: (state, action) => {
            const index = state[0].content.findIndex(({id}) => id === action.payload.id);
            state[0].content.splice(index, 1);
        },
    },
});

const {reducer} = deliverySlice;
export default reducer