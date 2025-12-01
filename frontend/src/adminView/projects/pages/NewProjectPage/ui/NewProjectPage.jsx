import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "adminView/layout/Layout";
import { CURRENT_PATH } from "shared/consts/localstorage";

import { NewProjectContent } from "adminView/projects/features/NewProjectContent";

const NewProjectPage = () => {
    const location = useLocation();

    useEffect(() => {
        sessionStorage.setItem(CURRENT_PATH, location.pathname);
    }, [location.pathname]);

    return (
        <Layout>
            <NewProjectContent />
        </Layout>
    );
};

export default NewProjectPage;