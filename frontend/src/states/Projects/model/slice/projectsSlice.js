import { createSlice } from "@reduxjs/toolkit";

import {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject,
    getLibraryFiles
} from "../services";

import { handlePending } from "shared/lib/handlePending";
import { handleRejected } from "shared/lib/handleRejected";
import { handlePagePending } from "shared/lib/handlePagePending";
import { handlePageRejected } from "shared/lib/handlePageRejected";

const initialState = {
    currentProjectId: null,
    currentProject: {
        id: -1,
        name: "",
    },
    projects: [],
    projectNames: {},
    libraryFiles: [],
    loading: false,
    pageLoading: false,
    error: null,
};

export const projectsSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setProjects(state, action) {
            state.projects = [...action.payload];
            for (const p of state.projects) {
                const proj = p?.project ?? p;
                if (proj?.id != null && typeof proj?.name === "string") {
                    state.projectNames[proj.id] = proj.name;
                }
            }
        },
        addProjectLocal(state, action) {
            const proj = action.payload?.project ?? action.payload;
            state.projects.push(proj);
            if (proj?.id != null && typeof proj?.name === "string") {
                state.projectNames[proj.id] = proj.name;
            }
            if (state.currentProjectId === null) {
                state.currentProjectId = proj.id;
            }
        },
        clearProjects(state) {
            state.projects = [];
            state.currentProjectId = null;
            state.currentProject = { id: -1, name: "" };
        },
        setCurrentProjectId(state, action) {
            state.currentProjectId = action.payload ?? null;
        },
        setProjectName(state, action) {
            const { id, name } = action.payload || {};
            if (id != null && typeof name === "string") {
                state.projectNames[id] = name;
                if (state.currentProject?.id === id) {
                    state.currentProject.name = name;
                }
                const idx = state.projects.findIndex(p => (p?.project ?? p)?.id === id);
                if (idx !== -1) {
                    const plain = state.projects[idx]?.project ?? state.projects[idx];
                    state.projects[idx] = { ...plain, name };
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createProject.pending, handlePending)
            .addCase(createProject.fulfilled, (state, action) => {
                const proj = action.payload?.project ?? action.payload;
                state.projects.push(proj);
                if (proj?.id != null && typeof proj?.name === "string") {
                    state.projectNames[proj.id] = proj.name;
                }
                if (state.currentProjectId === null) {
                    state.currentProjectId = proj.id;
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(createProject.rejected, handleRejected)

            .addCase(getProjects.pending, handlePagePending)
            .addCase(getProjects.fulfilled, (state, action) => {
                const arr = Array.isArray(action.payload)
                    ? action.payload.map(item => item?.project ?? item)
                    : [];
                state.projects = arr;

                state.projectNames = {};
                for (const p of arr) {
                    if (p?.id != null && typeof p?.name === "string") {
                        state.projectNames[p.id] = p.name;
                    }
                }

                if (state.currentProjectId === null && arr.length) {
                    state.currentProjectId = arr[0].id;
                }
                state.pageLoading = false;
                state.error = null;
            })
            .addCase(getProjects.rejected, handlePageRejected)

            .addCase(getProject.pending, handlePagePending)
            .addCase(getProject.fulfilled, (state, action) => {
                const proj = action.payload?.project ?? action.payload;
                state.currentProject = proj;
                state.currentProjectId = proj?.id ?? null;

                if (proj?.id != null && typeof proj?.name === "string") {
                    state.projectNames[proj.id] = proj.name;
                }
                state.pageLoading = false;
                state.error = null;
            })
            .addCase(getProject.rejected, handlePageRejected)

            .addCase(updateProject.pending, handlePending)
            .addCase(updateProject.fulfilled, (state, action) => {
                const updated = action.payload?.project ?? action.payload;

                const idx = state.projects.findIndex(p => (p?.project ?? p)?.id === updated.id);
                if (idx !== -1) {
                    const plain = state.projects[idx]?.project ?? state.projects[idx];
                    state.projects[idx] = { ...plain, ...updated };
                }

                if (state.currentProject?.id === updated.id) {
                    state.currentProject = { ...state.currentProject, ...updated };
                }

                if (updated?.id != null && typeof updated?.name === "string") {
                    state.projectNames[updated.id] = updated.name;
                }

                state.loading = false;
                state.error = null;
            })
            .addCase(updateProject.rejected, handleRejected)

            .addCase(deleteProject.pending, handlePending)
            .addCase(deleteProject.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.projects = state.projects.filter(p => p?.id !== deletedId);
                delete state.projectNames[deletedId];

                if (state.currentProjectId === deletedId) {
                    state.currentProjectId = state.projects[0]?.id ?? null;
                    state.currentProject = state.projects[0] ?? { id: -1, name: "" };
                }

                state.loading = false;
                state.error = null;
            })
            .addCase(deleteProject.rejected, handleRejected)

            .addCase(getLibraryFiles.pending, handlePagePending)
            .addCase(getLibraryFiles.fulfilled, (state, action) => {
                const arr = Array.isArray(action.payload) ? action.payload : [];
                state.libraryFiles = arr.map(({ hash, presign_link, name }) => ({
                    hash,
                    url: presign_link,
                    name
                }));
                state.pageLoading = false;
                state.error = null;
            })
            .addCase(getLibraryFiles.rejected, handlePageRejected);
    },
});

export const { actions: projectsActions } = projectsSlice;
export const { reducer: projectsReducer } = projectsSlice;
