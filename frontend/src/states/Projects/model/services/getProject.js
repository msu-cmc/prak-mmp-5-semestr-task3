import { createAsyncThunk } from "@reduxjs/toolkit";
import ProjectAPI from "shared/api/ProjectAPI";

export const getProject = createAsyncThunk(
    "projects/getProject",
    async (project_id, thunkAPI) => {
        try {
            const response = await ProjectAPI.getProject(project_id);
            
            if (!response)
                throw "Не удалось получить проект";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }

            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);