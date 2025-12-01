import { useEffect, useMemo, useState } from "react";

const DEFAULT = [
    "Размышляет над ответом",
    "Считаем нужные сущности",
    "Размышляет",
    "Думает"
];

const ThinkingStatus = ({
    phrases = DEFAULT,
    cycleMs = 1600,
    dotMs = 350,
    maxDots = 3,
    shuffle = true,
    className = ""
}) => {
    const list = useMemo(() => {
        const arr = phrases.filter(Boolean);
        if (!arr.length) return DEFAULT;
        if (!shuffle) return arr;
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }, [phrases, shuffle]);

    const [idx, setIdx] = useState(0);
    const [dots, setDots] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setIdx(v => (v + 1) % list.length), cycleMs);
        return () => clearInterval(id);
    }, [list.length, cycleMs]);

    useEffect(() => {
        const id = setInterval(() => setDots(v => (v + 1) % (maxDots + 1)), dotMs);
        return () => clearInterval(id);
    }, [dotMs, maxDots]);

    return (
        <span className={"pd-thinking " + className} aria-live="polite">
            <span key={idx} className="pd-thinking__text">
                {list[idx]}
            </span>
            <span className="pd-thinking__dots">
                {".".repeat(dots)}
            </span>
        </span>
    );
};

export default ThinkingStatus;