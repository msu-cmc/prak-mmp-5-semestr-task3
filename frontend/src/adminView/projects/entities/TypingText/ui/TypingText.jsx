import { useEffect, useMemo, useRef, useState } from "react";

const TypingText = ({
    text,
    speed = 45,
    start = true,
    cursor = true,
    onDone,
    onTick
}) => {
    const src = String(text ?? "");
    const [i, setI] = useState(start ? 0 : src.length);
    const textRef = useRef(src);

    useEffect(() => {
        textRef.current = String(text ?? "");
        setI(start ? 0 : textRef.current.length);
    }, [text, start]);

    useEffect(() => {
        if (!start) return;
        const total = textRef.current.length;
        if (i >= total) {
            onDone?.();
            return;
        }
        const interval = Math.max(8, Math.floor(1000 / Math.max(1, speed)));
        const id = setTimeout(() => {
            setI((v) => Math.min(v + 1, total));
            onTick?.();
        }, interval);
        return () => clearTimeout(id);
    }, [i, start, speed, onDone, onTick]);

    const out = useMemo(() => textRef.current.slice(0, i), [i]);
    const showCursor = cursor && start && i < textRef.current.length;

    return (
        <span className="pd-typing">
            {out}
            {showCursor && <span className="pd-caret">▍</span>}
        </span>
    );
};

export default TypingText;