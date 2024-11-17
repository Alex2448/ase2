import {Notification, toaster} from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

export default function openNotification(type, title, message) {
    // type options (enum: "info","success","warning","error"
    const notification = (
        <Notification type={type} header={title} closable>
            <div style={{minWidth:320}}>
                {message}
            </div>
        </Notification>
    );

    return (
        toaster.push(notification, {placement: "topEnd"})
    );
}