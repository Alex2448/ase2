import * as React from 'react';
import {useCallback, useEffect, useState} from "react";
import { Modal} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import {InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from '@mui/material/FormControl';
import UserService from "../../../services/user.service";
import BoxService from "../../../services/box.service";
import openNotification from "../../Animations/notification";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import {useDispatch} from "react-redux";
import {createDelivery, retrieveDeliveries} from "../../../reducers/delivery.reducer";

export default function CreateNewDeliveryModal() {

    const dispatch = useDispatch();

    const page = 0;
    const refetch = useCallback(() => {
        dispatch(retrieveDeliveries({page}));
    }, [dispatch])

    // Form Variables
    const [customerId, setCustomerId] = useState("")
    const [delivererId, setDelivererId] = useState("")
    const [targetBoxId, setTargetBoxId] = useState("")
    // API Data
    const [customer, setCustomer] = useState([]);
    const [deliverer, setDeliverer] = useState([]);
    const [boxes, setBoxes] = useState([]);
    // MaterialUI Actions
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        await UserService.getUsersByRole("customer")
            .then((response) => {
                setCustomer(response.data)
            })
        await UserService.getUsersByRole("deliverer")
            .then((response) => {
                setDeliverer(response.data)
            })
        await BoxService.getAvailableBoxes()
            .then((response) => {
                setBoxes(response.data)
            })
    }

    useEffect(async () => {
        fetchData()
            .catch((error) => {
                openNotification("error", "Error", "Error while loading data " + error.message)
            })
    }, [])

    const onSubmit = () => {
        setLoading(true)
        dispatch(createDelivery({customerId, delivererId, targetBoxId}))
            .unwrap()
            .then(() => {
                openNotification("success", "New Delivery", "A New Delivery has been created.");
                setLoading(false)
                refetch();
                setOpen(false);
            })
            .catch((error) => {
                openNotification("error", "Error", error.response);
                setLoading(false)
            })
    }

    return (
        <div className="modal-container">

            <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon/>} onClick={handleOpen}>
                CREATE
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title><h4>Create New Delivery</h4></Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <InputLabel autoFocus id="customerEmail" required>Customer Email</InputLabel>
                        <Select
                            labelId="customerEmail"
                            name="customerEmail"
                            id="customerEmail"
                            value={customerId}
                            autoFocus={true}
                            label="Customer Email"
                            onChange={(event) => setCustomerId(event.target.value)}
                        >
                            {customer.map((customer) => (
                                <MenuItem key={customer.id} value={customer.id}>{customer.email}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <InputLabel autoFocus id="delivererEmail" required>Deliverer Email</InputLabel>
                        <Select
                            labelId="delivererEmail"
                            name="delivererEmail"
                            id="delivererEmail"
                            value={delivererId}
                            label="Deliverer Email"
                            onChange={(event) => setDelivererId(event.target.value)}
                        >
                            {deliverer.map((deliverer) => (
                                <MenuItem key={deliverer.id}
                                          value={deliverer.id}>{deliverer.email}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <InputLabel autoFocus id="boxName" required>Box</InputLabel>
                        <Select
                            labelId="boxName"
                            name="boxName"
                            id="boxName"
                            value={targetBoxId}
                            label="Box Name"
                            onChange={(event) => setTargetBoxId(event.target.value)}
                        >
                            {boxes.map((box) => (
                                <MenuItem key={box.id} value={box.id}>{box.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="success"
                        sx={{mt: 3, mb: 2}}
                        loading={loading}
                        onClick={onSubmit}>
                        Submit
                    </LoadingButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
};