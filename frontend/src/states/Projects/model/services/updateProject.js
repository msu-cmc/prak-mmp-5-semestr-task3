import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import ProjectAPI from "shared/api/ProjectAPI";

export const updateProject = createAsyncThunk(
    "projects/updateProject",
    async ({ project_id, name }, thunkAPI) => {
        try {
            const response = await ProjectAPI.updateProject(project_id, { name });
            
            if (!response)
                throw "Не удалось обновить проект";

            if (response.errors) {
                if (Array.isArray(response.data?.detail))
                    throw response.data?.detail[0]?.msg;
                else
                    throw response.data?.detail;
            }

            toast.success("Проект обновлён");
            return response.data;
        } catch (e) {
            return thunkAPI.rejectWithValue(e);
        }
    }
);