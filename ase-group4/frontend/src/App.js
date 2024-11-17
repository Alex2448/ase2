// React
import React from 'react';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
//Redux
import {Provider} from "react-redux";
import store from "./store";
// MUI
import {ThemeProvider} from "@mui/material";
import theme from './theme/index.theme';
import './App.css';
// Components
import * as routes from './constants/routes';
import {history} from "./constants/history"
// Views
import Navbar from "./components/Navigation/navbar";
import SignInPage from "./components/SignIn/signInPage";
import DispatcherDashboard from "./components/DispatcherDashboard";
import NotFoundPage from "./components/404";
import UserManagement from "./components/DispatcherDashboard/UserManagement/userOverview";
import DeliveriesManagement from "./components/DispatcherDashboard/DeliveriesManagement/deliveryOverview";
import BoxManagement from "./components/DispatcherDashboard/BoxManagement/boxOverview";
import DeliveriesCustomerManagement from "./components/CustomerDashboard/deliveryManagement";
import Account from "./components/DispatcherDashboard";
import DeliveryManagement from "./components/DelivererDashboard/deliveryManagement";

const App = () => (
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <BrowserRouter history={history}>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/signin"/>}/>
                    <Route exact path={routes.SIGN_IN} element={<SignInPage/>}/>
                    <Route exact path={routes.ACCOUNT} element={<Account/>}/>
                    {/* Dispatcher Routes */}
                    <Route exact path={routes.DISPATCHER_DASHBOARD} element={<DispatcherDashboard/>}/>
                    <Route exact path={routes.USER_MANAGEMENT} element={<UserManagement/>}/>
                    <Route exact path={routes.DELIVERIES_MANAGEMENT} element={<DeliveriesManagement/>}/>
                    <Route exact path={routes.BOX_MANAGEMENT} element={<BoxManagement/>}/>
                    {/* Customer Routes */}
                    <Route exact path={routes.DELIVERY_MANAGEMENT_CUSTOMER} element={<DeliveriesCustomerManagement/>}/>
                    {/* Deliverer Routes */}
                    <Route exact path={routes.DELIVERY_MANAGEMENT_DELIVERER} element={<DeliveryManagement/>}/>
                    <Route path="*" element={<NotFoundPage/>}/>
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </Provider>
)

export default App;
