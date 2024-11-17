import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {deleteBox, retrieveBoxes} from "../../../reducers/boxes.reducer";
import {
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
import CreateNewBoxModal from "./createNewBoxModal";
import UpdateBoxModal from "./updateBoxModal";
import dateFormat from "dateformat";
import openNotification from "../../Animations/notification";
import {Modal} from "rsuite";
import LoadingButton from "@mui/lab/LoadingButton";

export default function BoxManagement() {

    const boxes = useSelector(state => state.boxes);
    const dispatch = useDispatch();
    const [page, setPage] = useState(0);

    const initFetch = useCallback(() => {
        dispatch(retrieveBoxes({page}));
    }, [dispatch, page])

    useEffect(() => {
        initFetch()
    }, [initFetch])

    // Delete Functionality
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false)
    const handleOpenDeleteModal = (box) => {
        setSelected(box);
        setOpenDeleteModal(true)
    }
    const handleCloseDeleteModal = () => {
        setSelected(null);
        setOpenDeleteModal(false);
    }
    const removeBox = (id) => {
        setLoading(true)
        dispatch(deleteBox({id}))
            .then((response) => {
                openNotification("success", "Box Deleted", "Box was successfully deleted.");
                handleCloseDeleteModal();
                setLoading(false)
                initFetch();
            })
            .catch((error) => {
                openNotification("error", "Error", "Error occurred." + error.message)
                setLoading(false)
                handleCloseDeleteModal()
            });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    return (
        <Container maxWidth="lg">
            <Stack direction="row" spacing={2}>
                <h3>Box Management</h3>
            </Stack>
            <Stack direction="row" spacing={2}>
                <CreateNewBoxModal/>
            </Stack>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="delivery-table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Rasperry Pi ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Street</TableCell>
                            <TableCell>Postcode</TableCell>
                            <TableCell>State</TableCell>
                            <TableCell>City</TableCell>
                            <TableCell>Country</TableCell>
                            <TableCell>Created At</TableCell>
                            <TableCell>Updated At</TableCell>
                            <TableCell>Edit</TableCell>
                            <TableCell>Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {boxes[0] !== undefined && boxes[0].content.map(box => (
                            <TableRow key={box.id} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell component="th" scope="row">{box.raspberryId}</TableCell>
                                <TableCell component="th" scope="row">{box.name}</TableCell>
                                <TableCell component="th" scope="row">{box.street}</TableCell>
                                <TableCell component="th" scope="row">{box.postcode}</TableCell>
                                <TableCell component="th" scope="row">{box.state}</TableCell>
                                <TableCell component="th" scope="row">{box.city}</TableCell>
                                <TableCell component="th" scope="row">{box.country}</TableCell>
                                <TableCell component="th" scope="row">{dateFormat(box.createdAt, "default")}</TableCell>
                                <TableCell component="th" scope="row">{dateFormat(box.updatedAt, "default")}</TableCell>
                                <TableCell>
                                    <UpdateBoxModal boxId={box.id}
                                                    boxRasperryId={box.raspberryId}
                                                    boxName={box.name}
                                                    boxStreet={box.street}
                                                    boxPostcode={box.postcode}
                                                    boxState={box.state}
                                                    boxCity={box.city}
                                                    boxCountry={box.country}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="error" aria-label="upload picture" component="span"
                                                onClick={() => handleOpenDeleteModal(box)}>
                                        <DeleteForeverIcon/>
                                    </IconButton>
                                    <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
                                        <Modal.Header>
                                            <Modal.Title>Delete
                                                Box {selected !== null && selected.name}?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            Are you sure you want to delete this box?
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <LoadingButton type="submit"
                                                                 fullWidth
                                                                 loading={loading}
                                                                 color="error"
                                                                 variant="contained"
                                                    sx={{mt: 3, mb: 2}}
                                                    onClick={() => removeBox(selected.id)}>Delete</LoadingButton>
                                        </Modal.Footer>
                                    </Modal>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            {boxes[0] !== undefined &&
                                <TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={11}
                                    count={boxes[0].totalElements}
                                    rowsPerPage={boxes[0].size}
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
