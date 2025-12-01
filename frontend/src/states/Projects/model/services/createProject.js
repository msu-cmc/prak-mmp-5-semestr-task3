import { createAsyncThunk } from "@reduxjs/toolkit";
import ProjectAPI from "shared/api/ProjectAPI";

export const createProject = createAsyncThunk(
    "projects/createProject",
    async (data, thunkAPI) => {
        try {
            const response = await ProjectAPI.createProject(data);

            if (!response)
                throw "Не удалось создать проект";
            
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
