import { useState } from "react";
import { useLocation } from "react-router-dom";

import { Layout } from "adminView/layout/Layout";

import { CURRENT_PATH } from "shared/consts/localstorage";

import { FirstPageContent } from "adminView/projects/features/FirstPageContent";

const FirstPage = () => {
    const location = useLocation();
    const [uploadHandler, setUploadHandler] = useState(null);
    const [projectCreated, setProjectCreated] = useState(false);

    sessionStorage.setItem(CURRENT_PATH, location.pathname);

    const handleUploadRequest = (handler) => {
        setUploadHandler(() => handler);
    };

    const handleProjectCreated = (created) => {
        setProjectCreated(created);
    };

    return (
        <Layout onUploadClick={projectCreated ? null : uploadHandler}>
            <FirstPageContent
                onRequestUpload={handleUploadRequest}
                onProjectCreated={handleProjectCreated}
            />
        </Layout>
    )
}

export default FirstPage;
