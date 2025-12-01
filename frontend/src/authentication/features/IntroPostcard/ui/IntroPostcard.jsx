import "./IntroPostcard.css";
import { useEffect } from "react";

const IntroPostcard = ({ src, onDone, fadeMs = 700, revealMs = 1200, holdMs = 300, exitMs = 220 }) => {
    useEffect(() => {
        const t = setTimeout(() => onDone && onDone(), fadeMs + revealMs + holdMs + exitMs);
        document.body.style.overflow = "hidden";
        return () => {
            clearTimeout(t);
            document.body.style.overflow = "";
        };
    }, [fadeMs, revealMs, holdMs, exitMs, onDone]);

    return (
        <div
            className="intro-overlay intro-overlay--autoexit"
            style={{
                ["--fade-ms"]: `${fadeMs}ms`,
                ["--reveal-ms"]: `${revealMs}ms`,
                ["--hold-ms"]: `${holdMs}ms`,
                ["--exit-ms"]: `${exitMs}ms`,
                ["--delay"]: `${fadeMs}ms`
            }}
        >
            <div className="intro-card">
                <img className="intro-img intro-single" src={src} alt="" />
            </div>
        </div>
    );
};

export default IntroPostcard;
