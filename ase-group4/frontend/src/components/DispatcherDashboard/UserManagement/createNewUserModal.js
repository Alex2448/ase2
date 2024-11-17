import React, {useCallback, useState} from "react";
import {useDispatch} from "react-redux";
import {createUser, retrieveUsers} from "../../../reducers/users.reducer";
import Button from "@mui/material/Button";
import {Modal} from "rsuite";
import TextField from "@mui/material/TextField";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import LoadingButton from "@mui/lab/LoadingButton";
import {InputAdornment, InputLabel, Select} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import openNotification from "../../Animations/notification";
import FormControl from "@mui/material/FormControl";
import * as EmailValidator from 'email-validator';

export default function CreateNewUserModal() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const initialUserState = {
        id: null,
        username: "",
        email: "",
        role: "",
        password: ""
    };

    const [user, setUser] = useState(initialUserState);

    const dispatch = useDispatch();

    const handleInputChange = event => {
        const {name, value} = event.target;
        setUser({...user, [name]: value});
    };

    const page = 0;
    const reFetch = useCallback(() => {
        dispatch(retrieveUsers({page}));
    }, [dispatch])

    const roleArray = [
        {value: "Dispatcher"},
        {value: "Customer"},
        {value: "Deliverer"}
    ]

    const [loading, setLoading] = useState(false)
    const saveUser = () => {
        setLoading(true)
        const {username, email, role, password} = user;

        dispatch(createUser({username, email, role, password}))
            .unwrap()
            .then(data => {
                setLoading(false)
                openNotification("success", "Success", "User successfully registered.")
                reFetch();
                setOpen(false);
            })
            .catch((error) => {
                openNotification("error", "Error", "Error occurred. " + error.message)
            });
    };

    const validateForm = () => {
        if (user.username.length < 5 || user.username.length > 20) {
            return true
        }
        if (user.email.length > 50 || EmailValidator.validate(user.email) === false) {
            return true
        }
        if (user.password.length < 6 || user.password.length > 40) {
            return true
        }
        if (user.role === "") {
            return true
        }
        return false
    }

    return (
        <div className="modal-container">
            <Button variant="contained" color="success" startIcon={<AddCircleOutlineIcon/>} onClick={handleOpen}>
                CREATE
            </Button>
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            autoFocus
                            error={user.username.length <= 5 || user.username.length > 20}
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            value={user.username || ''}
                            onChange={handleInputChange}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{user.username.length}/5-20 characters</InputAdornment>,
                            }}
                        />
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            error={user.email.length > 50 || EmailValidator.validate(user.email) === false}
                            label="Email"
                            name="email"
                            autoComplete="email"
                            value={user.email || ''}
                            onChange={handleInputChange}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{EmailValidator.validate(user.email) ? "valid email": "provide valid email"}</InputAdornment>,
                            }}
                        />
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <InputLabel id="role" required>Role</InputLabel>
                        <Select
                            labelId="role"
                            name="role"
                            id="role"
                            error={user.role === ""}
                            fullWidth
                            value={user.role}
                            label="Role"
                            onChange={handleInputChange}
                        >
                            {roleArray.map((role) => (
                                <MenuItem key={role.value} value={role.value}>{role.value}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                        <TextField
                            margin="normal"
                            type="password"
                            required
                            fullWidth
                            id="password"
                            error={user.password.length < 6 || user.password.length > 40}
                            label="Password"
                            name="password"
                            autoComplete="password"
                            value={user.password || ''}
                            onChange={handleInputChange}
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="start">{user.password.length}/6 - 40 characters</InputAdornment>,
                            }}
                        />
                    </FormControl>

                </Modal.Body>
                <Modal.Footer>
                    <LoadingButton
                        type="submit"
                        fullWidth
                        disabled={validateForm()}
                        color="success"
                        variant="contained"
                        onClick={saveUser}>
                        Submit
                    </LoadingButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
