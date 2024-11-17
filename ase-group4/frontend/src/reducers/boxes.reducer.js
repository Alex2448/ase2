import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import BoxService from "../services/box.service";

const initialState = [];

export const retrieveBoxes = createAsyncThunk(
    "boxes/retrieve",
    async ({page}) => {
        const res = await BoxService.getAllBoxes(page);
        return res.data;
    }
);

export const createBox = createAsyncThunk(
    "boxes/create",
    async ({ raspberryId, name, street, postcode, state, city, country }) => {
        const res = await BoxService.registerNewBox(raspberryId, name, street, postcode, state, city, country);
        return res.data;
    }
);

export const updateBox = createAsyncThunk(
    "boxes/update",
    async ({ id, name, street, postcode, state, city, country }) => {
        console.log(id)
        const res = await BoxService.updateBox(id, name, street, postcode, state, city, country);
        return res.data;
    }
);

export const deleteBox = createAsyncThunk(
    "boxes/delete",
    async ({ id }) => {
        await BoxService.deleteBox(id);
        return { id };
    }
);

const boxSlice = createSlice({
    name: "box",
    initialState,
    extraReducers: {
        [retrieveBoxes.fulfilled]: (state, action) => {
            return [action.payload];
        },
        [createBox.fulfilled]: (state, action) => {
            // state.push(action.payload);
        },
        [updateBox.fulfilled]: (state, action) => {
            const index = state[0].content.findIndex(boxes => boxes.id === action.payload.id);
            state[0].content[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [deleteBox.fulfilled]: (state, action) => {
            const index = state[0].content.findIndex(({ id }) => id === action.payload.id);
            state[0].content.splice(index, 1);
        },
    },
});

const { reducer } = boxSlice;
export default reducer;
