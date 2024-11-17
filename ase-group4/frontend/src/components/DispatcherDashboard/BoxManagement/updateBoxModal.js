import React, {useCallback, useState} from "react";
import { useDispatch } from "react-redux";
import {retrieveBoxes, updateBox} from "../../../reducers/boxes.reducer";
import {Modal} from "rsuite";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import openNotification from "../../Animations/notification";

export default function UpdateBoxModal(props) {

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    let boxState = {
        id: props.boxId,
        name: props.boxName,
        street: props.boxStreet,
        postcode: props.boxPostcode,
        state: props.boxState,
        city: props.boxCity,
        country: props.boxCountry
    };

    const [box, setBox] = useState(boxState);
    const [loading, setLoading] = useState(false)

    const dispatch = useDispatch();

    const handleInputChange = event => {
        const { name, value } = event.target;
        setBox({ ...box, [name]: value });
    };
    const handleClose = () => {
        setOpen(false);
    }

    const page = 0;
    const reFetch = useCallback(() => {
        dispatch(retrieveBoxes({page}));
    }, [dispatch])

    const saveBox = () => {
        setLoading(true)
        const {id, name, street, postcode, state, city, country } = box;
        dispatch(updateBox({ id, name, street, postcode, state, city, country }))
            .unwrap()
            .then((data) => {
                setLoading(false)
                openNotification("success", "Success", "The Box has successfully been updated.")
                reFetch();
                setOpen(false);
            })
            .catch((error) => {
                setLoading(false)
                openNotification("error", "Error", error.message)
            });
    };

    return (
        <div className="modal-container">
            <IconButton color="warning" aria-label="edit-delivery" component="span" onClick={handleOpen}>
                <EditIcon/>
            </IconButton>
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Update Box</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
