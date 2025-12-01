import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { HomeContent } from "adminView/home/features/HomeContent";
import { Layout } from "adminView/layout/Layout";

import { CURRENT_PATH } from "shared/consts/localstorage";

import { IntroPostcard } from "authentication/features/IntroPostcard";
import frontSvg from "shared/assets/items/favicon.svg";

const INTRO_SHOWN_KEY = "HOME_INTRO_SHOWN";

const HomePage = () => {
    const location = useLocation();

    sessionStorage.setItem(CURRENT_PATH, location.pathname);

    const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem(INTRO_SHOWN_KEY));

    useEffect(() => {
        if (!showIntro) return;
        sessionStorage.setItem(INTRO_SHOWN_KEY, "1");
    }, [showIntro]);

    return (
        <>
            {showIntro && (
                <IntroPostcard
                    src={frontSvg}
                    onDone={() => setShowIntro(false)}
                    fadeMs={700}
                    revealMs={1200}
                    holdMs={300}
                    exitMs={220}
                />
            )}
            <Layout>
                <HomeContent/>
            </Layout>
        </>
    );
};

export default HomePage;
