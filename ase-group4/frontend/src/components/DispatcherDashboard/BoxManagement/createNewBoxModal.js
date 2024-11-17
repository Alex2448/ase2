import React, {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {createBox, retrieveBoxes} from "../../../reducers/boxes.reducer";
import Button from "@mui/material/Button";
import {Modal} from "rsuite";
import TextField from "@mui/material/TextField";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import openNotification from "../../Animations/notification";
import LoadingButton from "@mui/lab/LoadingButton";

export default function CreateNewBoxModal() {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const initialBoxState = {
        id: null,
        raspberryId: "",
        name: "",
        street: "",
        postcode: "",
        state: "",
        city: "",
        country: ""
    };

    const [box, setBox] = useState(initialBoxState);

    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false)

    const handleInputChange = event => {
        const {name, value} = event.target;
        setBox({...box, [name]: value});
    };

    const page = 0

    const reFetch = useCallback(() => {
        dispatch(retrieveBoxes({page}));
    }, [dispatch])

    const saveBox = () => {
        setLoading(true)
        const {raspberryId, name, street, postcode, state, city, country} = box;

        dispatch(createBox({raspberryId, name, street, postcode, state, city, country}))
            .unwrap()
            .then((data) => {
                openNotification("success", "Success", "A New Box has been registered.")
                reFetch();
                setBox(initialBoxState)
                setLoading(false)
                setOpen(false);
            })
            .catch(e => {
                setLoading(false)
                openNotification("error", "Error", "A Error occured.")
            });
    };

    return (
        <div className="modal-container">
            <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon/>} onClick={handleOpen}>
                CREATE
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Create New Box</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        autoFocus
                        id="raspberryId"
                        label="Rasperry ID"
                        name="raspberryId"
                        autoComplete="raspberryId"
                        value={box.raspberryId || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        autoFocus
                        id="name"
                        label="Name"
                        name="name"
                        autoComplete="name"
                        value={box.name || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="street"
                        label="Street"
                        name="street"
                        autoComplete="street"
                        value={box.street || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="city"
                        label="City"
                        name="city"
                        autoComplete="city"
                        value={box.city || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="postcode"
                        label="Postcode"
                        name="postcode"
                        autoComplete="postcode"
                        value={box.postcode || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="state"
                        label="State"
                        name="state"
                        autoComplete="state"
                        value={box.state || ''}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="country"
                        label="Country"
                        name="country"
                        autoComplete="country"
                        value={box.country || ''}
                        onChange={handleInputChange}
                    />

                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton type="submit"
                                   variant="contained"
                                   color="success"
                                   fullWidth
                                   loading={loading}
                                   sx={{mt: 3, mb: 2}}
                                   onClick={saveBox}>
                        Submit
                    </LoadingButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
