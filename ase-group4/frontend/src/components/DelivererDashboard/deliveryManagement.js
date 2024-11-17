import {connect, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import DeliveryService from "../../services/delivery.service";
import openNotification from "../Animations/notification";
import {
    InputAdornment,
    InputLabel,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer, TableFooter,
    TableHead, TablePagination,
    TableRow, TextField
} from "@mui/material";
import Paper from "@mui/material/Paper";
import dateFormat from "dateformat";
import IconButton from "@mui/material/IconButton";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import {Modal} from "rsuite";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Container from "@mui/material/Container";
import SearchIcon from "@mui/icons-material/Search";
import LoadingButton from "@mui/lab/LoadingButton";
import addTag from "../Animations/tag";

function DeliveryManagement(props) {

    const {user: currentUser} = props;
    const auth = useSelector(state => state.auth);


    const [deliveryStatus, setDeliveryStatus] = useState('')
    const [page, setPage] = useState(0)
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(false)
    const [refresh, setRefresh] = useState(false);
    const [searchParam, setSearchParam] = useState("");

    /**
     * fetch Deliveries from Database
     * @returns {Promise<void>}
     */
    const fetchDeliveries = async () => {
        await DeliveryService.getAllActiveDeliveriesByUser(currentUser.username, page, searchParam)
            .then((response) => {
                setDeliveries(response.data)
            })
    }

    useEffect(() => {
        setRefresh(false)
        fetchDeliveries()
            .catch((error) => {
                openNotification("error", "Error", "Error while loading data.")
            })
    }, [page, refresh, searchParam])

    const [selected, setSelected] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const handleStatusModalOpen = (delivery) => {
        setSelected(delivery);
        setOpenStatusModal(true)
    }
    const handleStatusModalClose = () => {
        setSelected(null);
        setOpenStatusModal(false);
    }

    const changeStatus = async (deliveryId) => {
        setLoading(true)
        await DeliveryService.changeDeliveryStatus(deliveryId, deliveryStatus)
            .then((response) => {
                openNotification("success", "Status Changed", "The Status of the Delivery was changed.");
                handleStatusModalClose()
                setLoading(false)
                setRefresh(true)
            })
            .catch((error) => {
                setLoading(false)
                openNotification("error", "Error", error.message);
                handleStatusModalClose()
                setRefresh(false)
            })
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    return (
        <Container maxWidth="lg">
            <h3>Deliveries Management</h3>
            <TextField
                fullWidth
                label="Search"
                id="searchArticles"
                style={{marginBottom: "5t"}}
                margin="dense"
                value={searchParam}
                onChange={(event) => setSearchParam(event.target.value)}
                placeholder="Search for delivery with tracking code..."
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon/>
                        </InputAdornment>
                    ),
                }}/>
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
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveries !== null && deliveries.content !== undefined && deliveries.content.map(delivery => (
                            <TableRow key={delivery.id} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                                <TableCell
                                    align="right">{delivery.customer !== null ? delivery.customer.email : "Customer deleted"}</TableCell>
                                <TableCell
                                    align="right">{delivery.deliverer !== null ? delivery.deliverer.email : "Deliverer deleted"}</TableCell>
                                <TableCell
                                    align="right">{delivery.targetBox !== null ? delivery.targetBox.name : "Box deleted"}</TableCell>
                                <TableCell align="right">{
                                    delivery.status === "DELIVERED" ?
                                    addTag("green", delivery.status) :
                                        delivery.status === "ORDERED" ?
                                            addTag("red", delivery.status) :
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
                                            <Modal.Title>Change Status</Modal.Title>
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
                                            <LoadingButton type="submit"
                                                           fullWidth
                                                           color="success"
                                                           variant="contained"
                                                           sx={{mt: 3, mb: 2}}
                                                           loading={loading}
                                                           onClick={() => changeStatus(selected.id)}
                                            >Change
                                                Status</LoadingButton>
                                        </Modal.Footer>
                                    </Modal>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            {deliveries !== undefined && deliveries.content !== undefined &&
                                <TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={9}
                                    count={deliveries.totalElements}
                                    rowsPerPage={deliveries.size}
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
    )
}

function mapStateToProps(state) {
    const {isLoggedIn, user} = state.auth;
    return {
        isLoggedIn,
        user,
    };
}

export default connect(mapStateToProps)(DeliveryManagement);