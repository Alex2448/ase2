import * as React from 'react';
import {useState} from "react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MoreIcon from '@mui/icons-material/MoreVert';
import navlogo from "../../assets/images/navlogo.png";
import {ThemeProvider} from "@mui/material";
import {theme} from "../../theme/index.theme";
import * as routes from "../../constants/routes";
import {useNavigate} from "react-router-dom";
import {connect, useDispatch, useSelector} from "react-redux";
import {logout} from "../../actions/auth.action";
import {SIGN_IN} from "../../constants/routes";
import Avatar from "@mui/material/Avatar";

const Navbar = ({user}) => (
    <div>
        {user ? (
            <NavbarAuth user={user}/>
        ) : (
            <div/>
        )}
    </div>
);

function NavbarAuth(props) {
    const history = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);

    const {user: currentUser} = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Differ tabs according to account role
    let appBarTitle, tabsDispatcher;

    if (currentUser) {
        switch (currentUser.roles[0]) {
            case 'ROLE_DISPATCHER':
                appBarTitle = "Dispatcher Dashboard";
                tabsDispatcher = ['Deliveries', 'Users', 'Pick-Up Boxes'];
                break;
            case 'ROLE_DELIVERER':
                appBarTitle = "Deliverer Dashboard";
                tabsDispatcher = ['To Do'];
                break;
            case 'ROLE_CUSTOMER':
                appBarTitle = "Customer Dashboard";
                tabsDispatcher = ['My Deliveries'];
                break;
            default:
                break;
        }
    }

    const handleClick = (tab) => {
        setAnchorEl(null);
        handleMobileMenuClose();

        switch (tab) {
            case 'Users':
                history(routes.USER_MANAGEMENT);
                break;
            case 'Deliveries':
                history(routes.DELIVERIES_MANAGEMENT);
                break;
            case 'Pick-Up Boxes':
                history(routes.BOX_MANAGEMENT);
                break;
            case 'To Do':
                history(routes.DELIVERY_MANAGEMENT_DELIVERER);
                break;
            case 'My Deliveries':
                history(routes.DELIVERY_MANAGEMENT_CUSTOMER);
                break;
            default:
                break;
        }
    };

    const handleMobileMenuClose = () => {
        setMobileMoreAnchorEl(null);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        handleMobileMenuClose();
    };

    const handleMobileMenuOpen = (event) => {
        setMobileMoreAnchorEl(event.currentTarget);
    };

    const menuId = 'primary-search-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem disabled>{currentUser.email}</MenuItem>
            <MenuItem onClick={() => logOut()}>Logout</MenuItem>
        </Menu>
    );

    const mobileMenuId = 'primary-search-account-menu-mobile';
    const renderMobileMenu = (
        <Menu
            anchorEl={mobileMoreAnchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={mobileMenuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMobileMenuOpen}
            onClose={handleMobileMenuClose}
        >
            <MenuItem disabled>{currentUser.email}</MenuItem>
            <MenuItem onClick={() => logOut()}>Logout</MenuItem>
        </Menu>
    );

    const logOut = () => {
        dispatch(logout())
        history(SIGN_IN)
        handleMenuClose()
    }

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{flexGrow: 1}}>
                <AppBar position="static">
                    {currentUser ? (
                        <Toolbar>
                            <img src={navlogo} alt="Logo" style={{maxWidth: 40, marginBottom: 10, marginRight: 20}}/>
                            <Typography variant="h6" noWrap component="div"
                                        sx={{display: {xs: 'none', sm: 'block'}}}>{appBarTitle}</Typography>
                            {tabsDispatcher.map((tab) => (
                                <MenuItem key={tab} onClick={() => handleClick(tab)}>
                                    <Typography textAlign="center">{tab}</Typography>
                                </MenuItem>
                            ))}
                            <Box sx={{flexGrow: 1}}/>
                            <Box sx={{display: {xs: 'none', md: 'flex'}}}>

                                <IconButton
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-controls={menuId}
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    <Avatar alt="Avatar"/>
                                </IconButton>
                            </Box>
                            <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                                <IconButton
                                    size="large"
                                    aria-label="show more"
                                    aria-controls={mobileMenuId}
                                    aria-haspopup="true"
                                    onClick={handleMobileMenuOpen}
                                    color="inherit"
                                >
                                    <MoreIcon/>
                                </IconButton>
                            </Box>
                        </Toolbar>
                    ) : null}
                </AppBar>
                {renderMobileMenu}
                {renderMenu}
            </Box>
        </ThemeProvider>
    );
}

function mapStateToProps(state) {
    const {user} = state.auth;
    return {
        user,
    };
}

export default connect(mapStateToProps)(Navbar);