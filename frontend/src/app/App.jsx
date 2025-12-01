import "./styles/index.css"
import "@xyflow/react/dist/style.css";
import "yet-another-react-lightbox/styles.css";
import AppRouter from "app/providers/router/AppRouter";
import "bootstrap/dist/css/bootstrap.min.css"
import {useDispatch} from "react-redux";
import {useEffect} from "react";
import "react-toastify/dist/ReactToastify.css";
import { Slide, ToastContainer } from "react-toastify";
import useWindowDimensions from "shared/hooks/UseWindowDimensions";
import { loggedUserActions } from "states/LoggedUser";

const App = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(loggedUserActions.initUser())
    }, [dispatch])
    const { height} = useWindowDimensions();
    
    return (
        <div
            className="app"
            style={{
                height:height,
                minHeight: height
            }}
        >
            <AppRouter />
            <ToastContainer
                className="toast-custom"
                position="top-right"
                autoClose={3000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable
                pauseOnHover={false}
                theme="colored"
                transition={Slide}
            />
        </div>
    )
}

export default App
