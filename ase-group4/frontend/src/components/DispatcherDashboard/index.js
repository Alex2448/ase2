import {connect} from "react-redux";
import {useEffect} from "react";
import {
    DELIVERIES_MANAGEMENT,
    DELIVERY_MANAGEMENT_CUSTOMER,
    DELIVERY_MANAGEMENT_DELIVERER
} from "../../constants/routes";
import {useNavigate} from "react-router-dom";

function Account(props) {
    const {user: currentUser} = props;
    const role = currentUser.roles[0].substring(5)
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            switch (currentUser.roles[0]) {
                case "ROLE_DISPATCHER":
                    navigate(DELIVERIES_MANAGEMENT)
                    break;
                case "ROLE_CUSTOMER":
                    navigate(DELIVERY_MANAGEMENT_CUSTOMER)
                    break;
                case "ROLE_DELIVERER":
                    navigate(DELIVERY_MANAGEMENT_DELIVERER)
                    break;
            }
        }
    }, [])

    return (
        <div>null</div>
    )
}

function mapStateToProps(state) {
    const {user} = state.auth;
    return {
        user,
    };
}

export default connect(mapStateToProps)(Account);