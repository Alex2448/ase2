import * as React from 'react';
import {useEffect, useState} from "react";

// Styling
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import {ThemeProvider} from '@mui/material/styles';
import {theme} from "../../theme/index.theme"
import LoadingButton from '@mui/lab/LoadingButton';
import {ACCOUNT} from "../../constants/routes";

import {useNavigate} from "react-router-dom";

// Components
import openNotification from "../Animations/notification";

// Logic
import {connect, useDispatch, useSelector} from "react-redux";
import {login} from "../../actions/auth.action";


function SignInPage(props) {

    const {user: currentUser} = props;
    const auth = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    // Redirect automatically to dashboard if already logged in
    useEffect(() => {
        if (currentUser) {
            navigate(ACCOUNT);
        }
    }, [])

    // change form variables
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const onChange = (event) => {
        const {name, value} = event.target;
        if (name === "username") {
            setUsername(value);
        }
        if (name === "password") {
            setPassword(value);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        dispatch(login(username, password))
            .then((response) => {
                setLoading(false);
                navigate("/account");
            })
            .catch(() => {
                setLoading(false);
                openNotification("error", "Error", "Something went wrong. Please try again!")
            });
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{height: '100vh'}}>
                <CssBaseline/>
                <Grid item xs={false} sm={4} md={7} sx={{
                    backgroundImage: 'url(https://source.unsplash.com/featured/?nature)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) =>
                        t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={{my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',}}>
                        <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}><LockOutlinedIcon/></Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box component="form" noValidate onSubmit={handleSubmit} sx={{mt: 1}}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                onChange={(event) => onChange(event)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                onChange={(event) => onChange(event)}
                            />
                            <LoadingButton type="submit" fullWidth variant="contained" sx={{mt: 3, mb: 2}}
                                           loading={loading}>Sign In</LoadingButton>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}

function mapStateToProps(state) {
    const {isLoggedIn, user} = state.auth;
    return {
        isLoggedIn,
        user,
    };
}

export default connect(mapStateToProps)(SignInPage);