import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    deleteUser,
    retrieveUsers
} from "../../../reducers/users.reducer";
import {
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";
import Paper from "@mui/material/Paper";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import CreateNewUserModal from "./createNewUserModal";
import UpdateUserModal from "./updateUserModal";
import {Modal} from "rsuite";
import openNotification from "../../Animations/notification";
import LoadingButton from "@mui/lab/LoadingButton";
import MemoryIcon from '@mui/icons-material/Memory';
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import UserService from "../../../services/user.service";
import dateFormat from "dateformat";

export default function UserManagement() {

    const users = useSelector(state => state.users);
    const dispatch = useDispatch();

    const [page, setPage] = useState(0)

    const initFetch = useCallback(() => {
        dispatch(retrieveUsers({page}));
    }, [dispatch, page])

    useEffect(() => {
        initFetch()
    }, [initFetch])

    // Delete Functionality
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false)
    const handleOpenDeleteModal = (user) => {
        setSelected(user);
        setOpenDeleteModal(true)
    }
    const handleCloseDeleteModal = () => {
        setSelected(null);
        setOpenDeleteModal(false);
    }
    const removeUser = (id, username) => {
        setLoading(true)
        dispatch(deleteUser({id, username}))
            .then((response) => {
                openNotification("success", "Success", "User successfully deleted.")
                setLoading(false)
                handleCloseDeleteModal()
            })
            .catch((error) => {
                openNotification("error", "Error", "Error occured. " + error.message)
                setLoading(false)
                handleCloseDeleteModal()
            });
    };

    const [rfid, setRfid] = useState("");
    const [openRfidModal, setOpenRfidModal] = useState(false)
    const handleOpenRfidModal = (user) => {
        setSelected(user);
        setOpenRfidModal(true)
    }
    const handleCloseRfidModal = () => {
        setSelected(null);
        setOpenRfidModal(false)
    }
    const addRfidToUser = async (userId) => {
        setLoading(true)
        await UserService.addRfidToUser(userId, rfid)
            .then((response) => {
                openNotification("success", "Success", "Rfid Token successfully set.")
                setLoading(false)
                handleCloseRfidModal()
            })
            .catch((error) => {
                openNotification("error", "Error", "Error occurred. " + error.message)
                setLoading(false)
            })

    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    return (
        <Container maxWidth="lg">
            <Stack direction="row" spacing={2}>
                <h3>User Management</h3>
            </Stack>
            <Stack direction="row" spacing={2}>
                <CreateNewUserModal/>
            </Stack>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="delivery-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Password</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Updated At</TableCell>
                            <TableCell>RFID</TableCell>
                            <TableCell>Add RFID Token</TableCell>
                            <TableCell>Edit</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users[0] !== undefined && users[0].content.map(user => (
                            <TableRow key={user.id} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row">{user.username}</TableCell>
                                <TableCell component="th" scope="row">{user.email}</TableCell>
                                <TableCell component="th" scope="row">**********</TableCell>
                                <TableCell component="th"
                                           scope="row">{user.role && user.role.name.substring(5)}</TableCell>
                                <TableCell component="th"
                                           scope="row">{dateFormat(user.createdAt, "default")}</TableCell>
                                <TableCell component="th"
                                           scope="row">{dateFormat(user.updatedAt, "default")}</TableCell>
                                <TableCell component="th" scope="row">{user.rfidToken}</TableCell>
                                <TableCell component="th" scope="row">
                                    <IconButton color="error"
                                                component="span"
                                                onClick={() => handleOpenRfidModal(user)}>
                                        <MemoryIcon/>
                                    </IconButton>
                                    <Modal open={openRfidModal} onClose={handleCloseRfidModal}>
                                        <Modal.Header>
                                            <Modal.Title>Add Rfid To User {selected && selected.username}</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                                                <TextField
                                                    margin="normal"
                                                    type="rfid"
                                                    required
                                                    fullWidth
                                                    error={rfid.length < 5}
                                                    id="rfid"
                                                    label="RFID Token"
                                                    name="rfid"
                                                    value={rfid}
                                                    onChange={(event) => setRfid(event.target.value)}
                                                    InputProps={{
                                                        endAdornment: <InputAdornment
                                                            position="start">{rfid.length}/5 characters at
                                                            least</InputAdornment>,
                                                    }}
                                                />
                                            </FormControl>

                                        </Modal.Body>
                                        <Modal.Footer>
                                            <LoadingButton type="submit"
                                                           fullWidth color="success"
                                                           variant="contained"
                                                           disabled={rfid.length < 5}
                                                           loading={loading}
                                                           sx={{mt: 3, mb: 2}}
                                                           onClick={() => addRfidToUser(selected.id)}>
                                                Submit
                                            </LoadingButton>
                                        </Modal.Footer>
                                    </Modal>
                                </TableCell>
                                <TableCell>
                                    <UpdateUserModal userId={user.id}
                                                     username={user.username}
                                                     email={user.email}
                                                     role={user.role.name}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="error"
                                                component="span"
                                                onClick={() => handleOpenDeleteModal(user)}>
                                        <DeleteForeverIcon/>
                                    </IconButton>
                                    <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
                                        <Modal.Header>
                                            <Modal.Title>Delete
                                                User {selected !== null && selected.username}?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            Are you sure you want to delete this user?
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <LoadingButton type="submit"
                                                           fullWidth color="error"
                                                           variant="contained"
                                                           loading={loading}
                                                           sx={{mt: 3, mb: 2}}
                                                           onClick={() => removeUser(selected.id, selected.username)}>
                                                Delete
                                            </LoadingButton>
                                        </Modal.Footer>
                                    </Modal>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            {users[0] !== undefined &&
                                <TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={10}
                                    count={users[0].totalElements}
                                    rowsPerPage={users[0].size}
                                    page={page}
                                    SelectProps={{
                                        inputProps: {
                                            'aria-label': 'rows per page',
                                        },
                                        native: true,
                                    }}
                                    onPageChange={handleChangePage}
                                />
                            }
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Container>
    );
}