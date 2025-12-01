import { useEffect, useState } from "react";

const ThinkingDots = ({ interval = 350, max = 3, className = "" }) => {
    const [n, setN] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setN(v => (v + 1) % (max + 1)), interval);
        return () => clearInterval(id);
    }, [interval, max]);

    return <span className={className}>{".".repeat(n)}</span>;
};

export { ThinkingDots };
export default ThinkingDots;