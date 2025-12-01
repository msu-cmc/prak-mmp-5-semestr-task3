import { useLocation } from "react-router-dom";

import { Layout } from "adminView/layout/Layout";

import { CURRENT_PATH } from "shared/consts/localstorage";

import { ProjectsContent } from "adminView/projects/features/ProjectsContent";

const ProjectsMainPage = () => {
    const location = useLocation();

    sessionStorage.setItem(CURRENT_PATH, location.pathname);

    return (
        <Layout>
            <ProjectsContent/>
        </Layout>
    )
}

export default ProjectsMainPage;