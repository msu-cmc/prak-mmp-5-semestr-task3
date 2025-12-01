import { createAsyncThunk } from "@reduxjs/toolkit";
import ProjectAPI from "shared/api/ProjectAPI";

export const getLibraryFiles = createAsyncThunk(
    "projects/getLibraryFiles",
    async ({ presign_ttl = 3600 } = {}, thunkAPI) => {
        try {
            const response = await ProjectAPI.listLibraryFiles(presign_ttl);

            if (!response)
                throw "Не удалось получить список файлов";
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