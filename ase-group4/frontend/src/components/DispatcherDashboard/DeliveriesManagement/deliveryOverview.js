import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import Container from "@mui/material/Container";
import {
    TableCell,
    TableBody,
    Table,
    TableContainer,
    TableRow,
    TableHead,
    Select,
    InputLabel, TablePagination, TableFooter
} from "@mui/material";
import Paper from "@mui/material/Paper";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import IconButton from "@mui/material/IconButton";
import openNotification from "../../Animations/notification";
import FactCheckIcon from '@mui/icons-material/FactCheck';
import UpdateDeliveryModal from "./updateDeliveryModal";
import CreateNewDeliveryModal from "./createNewDeliveryModal";
import {
    retrieveDeliveries,
    deleteDelivery,
    updateDeliveryStatus
} from "../../../reducers/delivery.reducer";
import {Modal} from "rsuite";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import dateFormat from "dateformat";
import LoadingButton from "@mui/lab/LoadingButton";
import addTag from "../../Animations/tag";

export default function DeliveriesManagement(props) {

    const deliveries = useSelector(state => state.deliveries);
    const dispatch = useDispatch();

    const [openDeleteModal, setOpenDeleteModal] = useState(false);


    const [openStatusModal, setOpenStatusModal] = useState(false);

    const [deliveryStatus, setDeliveryStatus] = useState('')

    const [page, setPage] = useState(0)

    const initFetch = useCallback(() => {
        dispatch(retrieveDeliveries({page}))
    }, [dispatch, page])

    useEffect(() => {
        initFetch()
    }, [initFetch])

    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(null);
    const handleStatusModalOpen = (delivery) => {
        setSelected(delivery);
        setOpenStatusModal(true)
    }
    const handleStatusModalClose = () => {
        setSelected(null);
        setOpenStatusModal(false);
    }

    const changeStatus = (deliveryId) => {
        dispatch(updateDeliveryStatus({deliveryId, deliveryStatus}))
            .unwrap()
            .then(() => {
                openNotification("success", "Status Changed", "The Status of the Delivery was changed.");
                handleStatusModalClose()
                initFetch()
            })
            .catch((error) => {
                openNotification("error", "Error", error.message);
                handleStatusModalClose()
            })
    }

    const handleDeleteModalOpen = (delivery) => {
        setSelected(delivery);
        setOpenDeleteModal(true)
    }
    const handleDeleteModalClose = () => {
        setSelected(null);
        setOpenDeleteModal(false);
    }
    const removeDelivery = (deliveryId) => {
        setLoading(true)
        dispatch(deleteDelivery({deliveryId}))
            .then((response) => {
                openNotification("success", "Delivery Deleted", "Delivery was successfully deleted");
                setLoading(false)
                handleDeleteModalClose()
            })
            .catch((error) => {
                openNotification("error", "Error", error.message);
                setLoading(false)
                handleDeleteModalClose()
            })
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    return (
        <Container maxWidth="lg">
            <h3>Deliveries Management</h3>
            <CreateNewDeliveryModal/>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: 650}} aria-label="delivery-table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">Customer Email</TableCell>
                            <TableCell align="right">Deliverer Email</TableCell>
                            <TableCell align="right">Box Name</TableCell>
                            <TableCell align="right">Status</TableCell>
                            <TableCell align="right">Tracking Code</TableCell>
                            <TableCell align="right">Created At</TableCell>
                            <TableCell align="right">Last Updated At</TableCell>
                            <TableCell align="right">Change Status</TableCell>
                            <TableCell align="right">Edit</TableCell>
                            <TableCell align="right">Delete</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveries[0] !== undefined && deliveries[0].content.map(delivery => (
                            <TableRow key={delivery.id} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell
                                    align="right">{delivery.customer !== null ? delivery.customer.email : "Customer deleted"}</TableCell>
                                <TableCell
                                    align="right">{delivery.deliverer !== null ? delivery.deliverer.email : "Deliverer deleted"}</TableCell>
                                <TableCell
                                    align="right">{delivery.targetBox !== null ? delivery.targetBox.name : "Box deleted"}</TableCell>
                                <TableCell align="right">{delivery.status === "PICKED_UP" ?
                                    addTag("green", delivery.status) :
                                    addTag("yellow", delivery.status)
                                }
                                </TableCell>
                                <TableCell align="right">{delivery.trackingCode}</TableCell>
                                <TableCell align="right">{dateFormat(delivery.createdAt, "default")}</TableCell>
                                <TableCell align="right">{dateFormat(delivery.updatedAt, "default")}</TableCell>
                                <TableCell align="right">
                                    {delivery.status === "PICKED_UP" ? "" :
                                        <IconButton
                                            color="success"
                                            aria-label="change-status"
                                            component="span"
                                            onClick={() => handleStatusModalOpen(delivery)}>
                                            <FactCheckIcon/>
                                        </IconButton>
                                    }
                                    <Modal open={openStatusModal} onClose={handleStatusModalClose}>
                                        <Modal.Header>
                                            <Modal.Title>Change Status for {selected && selected.id}</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <FormControl fullWidth margin="normal" sx={{mt: 1, minWidth: 200}}>
                                                <InputLabel id="deliveryStatus">Delivery Status</InputLabel>
                                                <Select
                                                    labelId="deliveryStatus"
                                                    name="deliveryStatus"
                                                    id="deliveryStatus"
                                                    value={deliveryStatus}
                                                    autoFocus={true}
                                                    label="Delivery Status"
                                                    onChange={(event) => setDeliveryStatus(event.target.value)}
                                                >
                                                    <MenuItem value={"ordered"}>Ordered</MenuItem>
                                                    <MenuItem value={"collected"}>Collected</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button type="submit" fullWidth color="success" variant="contained"
                                                    sx={{mt: 3, mb: 2}}
                                                    onClick={() => changeStatus(selected.id)}>Change
                                                Status</Button>
                                        </Modal.Footer>
                                    </Modal>
                                </TableCell>
                                {delivery.status === "PICKED_UP" ? <TableCell align="right">{null}</TableCell> :
                                    <TableCell>
                                        <UpdateDeliveryModal deliveryId={delivery.id}
                                                             customerId={delivery.customer !== null ? delivery.customer.id : null}
                                                             delivererId={delivery.deliverer !== null ? delivery.deliverer.id : null}
                                                             boxId={delivery.targetBox !== null ? delivery.targetBox.id : null}
                                        />
                                    </TableCell>
                                }
                                <TableCell align="right">
                                    <IconButton color="error"
                                                component="span"
                                                onClick={() => handleDeleteModalOpen(delivery)}>
                                        <DeleteForeverIcon/>
                                    </IconButton>
                                    <Modal open={openDeleteModal} onClose={handleDeleteModalClose}>
                                        <Modal.Header>
                                            <Modal.Title>Delete Delivery?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            Delivery Id : {selected && selected.id}
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <LoadingButton type="submit"
                                                           fullWidth
                                                           color="error"
                                                           variant="contained"
                                                           sx={{mt: 3, mb: 2}}
                                                           onClick={() => removeDelivery(selected.id)}>
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
                            {deliveries[0] !== undefined &&
                                <TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={10}
                                    count={deliveries[0].totalElements}
                                    rowsPerPage={deliveries[0].size}
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
