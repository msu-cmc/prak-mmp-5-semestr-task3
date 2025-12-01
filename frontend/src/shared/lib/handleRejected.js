import { toast } from "react-toastify";

export const handleRejected = (state, action) => {
    state.loading = false;
    state.error = action.payload;
    if (action.payload?.name === "AbortError") {
        return;
    }
    if (action.payload?.message) toast.error(action.payload.message);
    else toast.error(action.payload);
};
