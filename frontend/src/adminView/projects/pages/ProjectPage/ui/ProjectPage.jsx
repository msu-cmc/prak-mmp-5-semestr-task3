import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import { Layout } from "adminView/layout/Layout";
import { CURRENT_PATH } from "shared/consts/localstorage";

import { ProjectContent } from "adminView/projects/features/ProjectContent";
import { getChats } from "states/Сhats";
import { getProject } from "states/Projects";

const ProjectPage = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const { projectId } = useParams();

    useEffect(() => {
        sessionStorage.setItem(CURRENT_PATH, location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        if (!projectId)
            return;
        dispatch(getProject(projectId));
        dispatch(getChats({project_id: projectId}));
    }, [dispatch, projectId]);

    return (
        <Layout>
            <ProjectContent />
        </Layout>
    );
};

export default ProjectPage;