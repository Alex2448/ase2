import { configureStore } from '@reduxjs/toolkit'
import boxesReducer from './reducers/boxes.reducer';
import usersReducer from './reducers/users.reducer';
import authReducer from './reducers/auth.reducer';
import deliveryReducer from "./reducers/delivery.reducer"

const reducer = {
    boxes: boxesReducer,
    deliveries: deliveryReducer,
    auth: authReducer,
    users: usersReducer
}

const store = configureStore({
    reducer: reducer,
    devTools: true,
})

export default store;