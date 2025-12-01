import { useEffect, useMemo, useRef } from "react";
import "./ChatMessages.css";
import { ThinkingStatus } from "adminView/projects/entities/ThinkingStatus";
import { TypingText } from "adminView/projects/entities/TypingText";

const ASSISTANT_IDS = new Set([0, 2]);

const toTs = (v) => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    if (typeof v === "string") {
        const d = Date.parse(v);
        if (!Number.isNaN(d)) return d;
        const num = Number(v.replace(/\D+/g, ""));
        if (Number.isFinite(num)) return num;
    }
    return NaN;
};

const keyOf = (m, i) => {
    const a = toTs(m.client_ts);
    if (Number.isFinite(a)) return a;
    const b = toTs(m.ts);
    if (Number.isFinite(b)) return b;
    const c = toTs(m.created_at);
    if (Number.isFinite(c)) return c;
    const d = toTs(m.createdAt);
    if (Number.isFinite(d)) return d;
    if (Number.isFinite(m.id)) return Number(m.id);
    return 9e15 + i;
};

export const ChatMessages = ({ messages }) => {
    const ref = useRef(null);
    const playedRef = useRef(new Set());

    const data = useMemo(() => {
        const arr = (Array.isArray(messages) ? messages : []).filter(Boolean);
        const withIdx = arr.map((m, i) => ({ m, i, k: keyOf(m, i) }));
        withIdx.sort((x, y) => (x.k - y.k) || (x.i - y.i));
        return withIdx.map(x => x.m);
    }, [messages]);

    const scrollToBottom = () => {
        const el = ref.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    };

    useEffect(() => {
        requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
    }, [data]);

    const shouldType = (m, k, role) => {
        // Если есть явный флаг shouldAnimate - используем его
        if (m.shouldAnimate === true) return true;
        // Иначе проверяем стандартную логику
        return role === "assistant" && !m.thinking && !m.pending && !playedRef.current.has(k);
    };

    const markTyped = (k) => {
        playedRef.current.add(k);
    };

    return (
        <div ref={ref} className="pd-msgs">
            {data.map((m, i) => {
                const role = m.role ?? (ASSISTANT_IDS.has(Number(m.user_id)) ? "assistant" : "user");
                const cls =
                    "pd-msg " +
                    (role === "assistant" ? "is-llm" : "is-user") +
                    (m.thinking ? " is-thinking" : "") +
                    (m.pending ? " is-pending" : "") +
                    (m.error ? " is-error" : "");
                const k = keyOf(m, i);
                const key = m.id ?? `m-${i}`;
                const typeNow = shouldType(m, k, role);

                return (
                    <div key={key} className={cls}>
                        <div className="pd-msg__bubble">
                            {m.thinking ? (
                                <ThinkingStatus
                                    phrases={[
                                        "Размышляет над ответом",
                                        "Считаем нужные сущности",
                                        "Размышляет",
                                        "Думает"
                                    ]}
                                    cycleMs={1600}
                                    dotMs={350}
                                    maxDots={3}
                                    shuffle
                                />
                            ) : role === "assistant" ? (
                                <TypingText
                                    text={String(m.text ?? "")}
                                    start={typeNow}
                                    speed={45}
                                    onDone={() => markTyped(k)}
                                    onTick={scrollToBottom}
                                />
                            ) : (
                                m.text
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatMessages;
