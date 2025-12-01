import { toast } from "react-toastify";

export const handlePageRejected = (state, action) => {
    state.pageLoading = false;
    state.error = action.payload?.message ?? action.payload;
    if (action.payload?.name === "AbortError") {
        return;
    }
    if (action.payload?.message) toast.error(action.payload.message);
    else toast.error(action.payload);
};
