import ReactDOM from "react-dom/client"
import App from "app/App"
import {StoreProvider} from "app/providers/StoreProvider";
import {BrowserRouter} from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
    <StoreProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StoreProvider>
)
