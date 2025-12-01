import {NotificationManager} from "react-notifications";

export function createNotification (type, message, title="") {
    switch (type) {
        case "info":
            NotificationManager.info("Info message");
            break;
        case "success":
            NotificationManager.success(message, title);
            break;
        case "warning":
            NotificationManager.warning(message, title, 3000);
            break;
        case "error":
            NotificationManager.error(message, title, 5000);
            break;
    }
};
