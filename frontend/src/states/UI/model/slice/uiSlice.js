import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: { sidebarOpen: true },
    reducers: {
        toggleSidebar: state => { state.sidebarOpen = !state.sidebarOpen; },
        openSidebar:   state => { state.sidebarOpen = true;  },
        closeSidebar:  state => { state.sidebarOpen = false; },
        setSidebar:  (state, { payload }) => { state.sidebarOpen = payload; },
    },
});

export const {
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSidebar,
} = uiSlice.actions;

export default uiSlice.reducer;
