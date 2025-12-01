import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import ProjectAPI from "shared/api/ProjectAPI";

export const deleteProject = createAsyncThunk(
    "projects/deleteProject",
    async (project_id, thunkAPI) => {
        try {
            const response = await ProjectAPI.deleteProject(project_id);
            
            if (!response)
                throw "Не удалось удалить проект";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }

            toast.success("Проект удалён");
            return project_id;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);