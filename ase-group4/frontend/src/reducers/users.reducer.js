import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import UserService from "../services/user.service";

const initialState = [];

export const createUser = createAsyncThunk(
    "users/create",
    async ({ username, email, role, password}) => {
        const res = await UserService.registerNewUser(username, email, role, password);
        return res.data;
    }
);

export const retrieveUsers = createAsyncThunk(
    "users/retrieve",
    async ({page}) => {
        const res = await UserService.getAllUser(page);
        return res.data;
    }
);

export const updateUser = createAsyncThunk(
    "users/update",
    async ({ updateUsername, newUsername, email, password, role }) => {
        const res = await UserService.updateUser(updateUsername, newUsername, email, password, role);
        return res.data;
    }
);

export const deleteUser = createAsyncThunk(
    "users/delete",
    async ({ id, username }) => {
        await UserService.deleteUser(username);
        return { id };
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    extraReducers: {
        [retrieveUsers.fulfilled]: (state, action) => {
            return [action.payload];
        },
        [createUser.fulfilled]: (state, action) => {
            state.push(action.payload);
        },
        [updateUser.fulfilled]: (state, action) => {
            const index = state.findIndex(({ id }) => id === action.payload.id);
            state[index] = {
                ...state[index],
                ...action.payload,
            };
        },
        [deleteUser.fulfilled]: (state, action) => {
            let index = state[0].content.findIndex(({ id }) => id === action.payload.id);
            state[0].content.splice(index, 1);
        },
    },
});

const { reducer } = userSlice;
export default reducer;
