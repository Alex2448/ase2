import React, {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {retrieveUsers, updateUser} from "../../../reducers/users.reducer";
import {Modal} from "rsuite";
import TextField from "@mui/material/TextField";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import {InputAdornment, InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import LoadingButton from "@mui/lab/LoadingButton";
import openNotification from "../../Animations/notification";
import * as EmailValidator from "email-validator";

export default function UpdateUserModal(props) {

    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const updateUsername = props.username;
    const [newUsername, setNewUsername] = useState(props.username);
    const [email, setEmail] = useState(props.email)
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");

    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }

    const roleArray = [
        {key: "ROLE_DISPATCHER", value: "Dispatcher"},
        {key: "ROLE_CUSTOMER", value: "Customer"},
        {key: "ROLE_DELIVERER", value: "Deliverer"}
    ]

    const page = 0;
    const reFetch = useCallback(() => {
        dispatch(retrieveUsers({page}));
    }, [dispatch])

    const saveUser = () => {
        setLoading(true)

        dispatch(updateUser({updateUsername, newUsername, email, password, role}))
            .unwrap()
            .then((response) => {
                openNotification("success", "Success", "User successfully updated.")
                setLoading(false)
                setOpen(false);
                reFetch();
            })
            .catch((error) => {
                openNotification("error", "Error", "Error occured. " + error.message)
                setLoading(false);
                setOpen(false);
            });
    };

    const validateForm = () => {
        if (newUsername.length < 5 || newUsername.length > 20) {
            return true
        }
        if (email.length > 50 || EmailValidator.validate(email) === false) {
            return true
        }
        if (password.length >= 1 && (password.length < 6 || password.length > 40)) {
            return true
        }
        return false
    }

    return (
        <div className="modal-container">
            <IconButton color="warning" aria-label="edit-delivery" component="span" onClick={handleOpen}>
                <EditIcon/>
            </IconButton>
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Update User</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            fullWidth
                            autoFocus
                            id="newUsername"
                            error={newUsername <= 5 || newUsername > 20}
                            label="Username"
                            name="newUsername"
                            autoComplete="newUsername"
                            value={newUsername}
                            onChange={(event) => setNewUsername(event.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{newUsername.length}/5-20 characters</InputAdornment>,
                            }}
                        />
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            fullWidth
                            id="email"
                            error={email > 50 || EmailValidator.validate(email) === false}
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{EmailValidator.validate(email) ? "valid email": "provide valid email"}</InputAdornment>,
                            }}
                        />
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <InputLabel id="role" >Role</InputLabel>
                        <Select
                            labelId="role"
                            name="role"
                            id="role"
                            fullWidth
                            value={role}
                            label="Role"
                            onChange={(event) => setRole(event.target.value)}
                        >
                            {roleArray.map((role) => (
                                <MenuItem key={role.key} value={role.value}>{role.value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            type="password"
                            fullWidth
                            id="password"
                            label="Password"
                            error={password >= 1 && (password.length < 6 || password.length > 40)}
                            name="password"
                            autoComplete="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{password.length}/6 - 40 characters</InputAdornment>,
                            }}
                        />
                    </FormControl>

                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton
                        type="submit"
                        fullWidth
                        color="success"
                        disabled={validateForm()}
                        loading={loading}
                        variant="contained"
                        onClick={saveUser}>
                        Submit
                    </LoadingButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
