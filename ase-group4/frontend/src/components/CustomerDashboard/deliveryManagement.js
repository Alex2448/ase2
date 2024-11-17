import React, {useEffect, useState} from "react";
import Container from "@mui/material/Container";
import DeliveryService from "../../services/delivery.service";
import {
    TableCell,
    TableBody,
    Table,
    TableContainer,
    TableRow,
    TableHead,
    Tabs,
    TextField,
    InputAdornment, TablePagination, TableFooter
} from "@mui/material";
import Paper from "@mui/material/Paper";
import {connect} from "react-redux";
import Typography from '@mui/material/Typography';
import dateFormat from "dateformat";
import openNotification from "../Animations/notification";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';
import addTag from "../Animations/tag";

function DeliveriesCustomerManagement(props) {

    const {user: currentUser} = props;

    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [pastDeliveries, setPastDeliveries] = useState([]);

    const [pageActive, setPageActive] = useState(0);
    const [pageDone, setPageDone] = useState(0);
    const [searchParamActive, setSearchParamActive] = useState("");
    const [searchParamDone, setSearchParamDone] = useState("");

    const fetchData = async () => {
        await DeliveryService.getAllActiveDeliveriesByUser(currentUser.username, pageActive, searchParamActive)
            .then((response) => {
                setActiveDeliveries(response.data);
            })
        await DeliveryService.getDeliveriesByUser(currentUser.username, "PICKED_UP", pageDone, searchParamDone)
            .then((response) => {
                setPastDeliveries(response.data)
            })
    }

    useEffect(() => {
        fetchData()
            .catch((error) => {
                openNotification("error", "Error", "Error occured. " + error.message)
            })
    }, [pageActive, pageDone, searchParamActive, searchParamDone])

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangePageActive = (event, newPage) => {
        setPageActive(newPage)
    }

    const handleChangePageDone = (event, newPage) => {
        setPageDone(newPage)
    }

    return (
        <Container maxWidth="lg">
            <Tabs value={value} onChange={handleChange} centered>
                <Tab label="Active Deliveries" {...a11yProps(0)} />
                <Tab label="Past Deliveries" {...a11yProps(1)} />
            </Tabs>
            <TabPanel value={value} index={0}>
                <h3>My Active Deliveries</h3>
                <TextField
                    fullWidth
                    label="Search"
                    id="searchArticles"
                    style={{marginBottom: "5t"}}
                    margin="dense"
                    value={searchParamActive}
                    onChange={(event) => setSearchParamActive(event.target.value)}
                    placeholder="Search for delivery with tracking code..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}/>
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">Deliverer Email</TableCell>
                                <TableCell align="right">Box Name</TableCell>
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">Tracking Code</TableCell>
                                <TableCell align="right">Created At</TableCell>
                                <TableCell align="right">Last Updated At</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activeDeliveries.content !== undefined && activeDeliveries.content.map(delivery => (
                                <TableRow
                                    key={delivery.id}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell align="right">{delivery.deliverer !== null ? delivery.deliverer.email : "Deliverer deleted"}</TableCell>
                                    <TableCell align="right">{delivery.targetBox !== null ? delivery.targetBox.name : "Box deleted"}</TableCell>
                                    <TableCell align="right">
                                        {delivery.status === "DELIVERED" ?
                                            addTag("green", delivery.status) :
                                            addTag("yellow", delivery.status)}
                                    </TableCell>
                                    <TableCell align="right">{delivery.trackingCode}</TableCell>
                                    <TableCell
                                        align="right">{dateFormat(delivery.createdAt, "default")}</TableCell>
                                    <TableCell
                                        align="right">{dateFormat(delivery.updatedAt, "default")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                {<TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={9}
                                    count={activeDeliveries.totalElements}
                                    rowsPerPage={activeDeliveries.size}
                                    page={pageActive}
                                    SelectProps={{
                                        inputProps: {
                                            'aria-label': 'rows per page',
                                        },
                                        native: true,
                                    }}
                                    onPageChange={handleChangePageActive}
                                />
                                }
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </TabPanel>

            <TabPanel value={value} index={1}>
                <h3>My Past Deliveries</h3>
                <TextField
                    fullWidth
                    label="Search"
                    id="searchArticles"
                    style={{marginBottom: "5t"}}
                    margin="dense"
                    value={searchParamDone}
                    onChange={(event) => setSearchParamDone(event.target.value)}
                    placeholder="Search for delivery with tracking code..."
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}/>
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: 650}} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="right">Deliverer Email</TableCell>
                                <TableCell align="right">Box Name</TableCell>
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">Tracking Code</TableCell>
                                <TableCell align="right">Created At</TableCell>
                                <TableCell align="right">Last Updated At</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pastDeliveries.content !== undefined && pastDeliveries.content.map(delivery => (
                                <TableRow
                                    key={delivery.id}
                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                >
                                    <TableCell align="right">{delivery.deliverer !== null ? delivery.deliverer.email : "Deliverer deleted"}</TableCell>
                                    <TableCell align="right">{delivery.targetBox !== null ? delivery.targetBox.name : "Box deleted"}</TableCell>
                                    <TableCell align="right">
                                        {addTag("green", delivery.status)}
                                    </TableCell>
                                    <TableCell align="right">{delivery.trackingCode}</TableCell>
                                    <TableCell
                                        align="right">{dateFormat(delivery.createdAt, "default")}</TableCell>
                                    <TableCell
                                        align="right">{dateFormat(delivery.updatedAt, "default")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                {<TablePagination
                                    rowsPerPageOptions={[5]}
                                    colSpan={9}
                                    count={pastDeliveries.totalElements}
                                    rowsPerPage={pastDeliveries.size}
                                    page={pageDone}
                                    SelectProps={{
                                        inputProps: {
                                            'aria-label': 'rows per page',
                                        },
                                        native: true,
                                    }}
                                    onPageChange={handleChangePageDone}
                                />
                                }
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </TabPanel>
        </Container>
    );
}

function mapStateToProps(state) {
    const {user} = state.auth;
    return {
        user,
    };
}

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default connect(mapStateToProps)(DeliveriesCustomerManagement);
