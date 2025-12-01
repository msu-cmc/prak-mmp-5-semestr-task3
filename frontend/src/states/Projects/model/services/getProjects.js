import { createAsyncThunk } from "@reduxjs/toolkit";
import ProjectAPI from "shared/api/ProjectAPI";

export const getProjects = createAsyncThunk(
    "projects/getProjects",
    async ({search = "" } = {}, thunkAPI) => {
        try {
            const response = await ProjectAPI.getProjects(search);

            if (!response)
                throw "Не удалось получить список проектов";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }
            
            return response.data.values;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);