import { useEffect, useMemo, useState } from "react";

export function useFitTitle(text, prefix, ref) {
    const [display, setDisplay] = useState(prefix + (text || ""));
    const ellipsis = "…";

    const measure = useMemo(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        return (font, s) => {
            ctx.font = font;
            return ctx.measureText(s).width;
        };
    }, []);

    useEffect(() => {
        const getFont = (el) => {
            const cs = window.getComputedStyle(el);
            return `${cs.fontStyle} ${cs.fontVariant} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`.replace(/\s+/g, " ").trim();
        };

        const computeFor = (el) => {
            if (!(el instanceof Element)) return;
            const font = getFont(el);
            const full = prefix + (text || "");
            const maxW = el.clientWidth || 0;

            if (maxW <= 0) {
                setDisplay(full);
                return;
            }
            if (measure(font, full) <= maxW) {
                setDisplay(full);
                return;
            }

            const base = prefix;
            const baseW = measure(font, base);
            const ellW = measure(font, ellipsis);

            if (baseW + ellW > maxW) {
                setDisplay(ellipsis);
                return;
            }

            const t = text || "";
            let lo = 0;
            let hi = t.length;
            let best = 0;

            while (lo <= hi) {
                const mid = (lo + hi) >> 1;
                const candidate = base + t.slice(0, mid) + ellipsis;
                const w = measure(font, candidate);
                if (w <= maxW) {
                    best = mid;
                    lo = mid + 1;
                } else {
                    hi = mid - 1;
                }
            }

            setDisplay(base + t.slice(0, best) + ellipsis);
        };

        const el = ref.current;
        if (!(el instanceof Element)) return;

        const ro = new ResizeObserver((entries) => {
            const target = entries[0]?.target;
            if (target instanceof Element) computeFor(target);
        });

        ro.observe(el);
        computeFor(el);

        const onWinResize = () => computeFor(ref.current);
        window.addEventListener("resize", onWinResize);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", onWinResize);
        };
    }, [text, prefix, ref, measure]);

    return display;
}
