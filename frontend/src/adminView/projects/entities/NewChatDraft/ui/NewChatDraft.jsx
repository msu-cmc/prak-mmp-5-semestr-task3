import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import "./NewChatDraft.css";
import { ComposerBar } from "shared/components/ComposerBar/Index";

const NewChatDraft = ({ value, onChange, onSubmit, disabled = false, onOpenUploadModal }) => {
    const phrases = useMemo(() => ([
        "Готов, когда ты готов.",
        "Рады тебя видеть.",
        "С чего начнём?",
        "Какой план на сегодня?",
        "Я на связи.",
        "Поехали.",
        "Давай сделаем это."
    ]), []);

    const [phrase, setPhrase] = useState(() => phrases[Math.floor(Math.random() * phrases.length)]);
    const [sending, setSending] = useState(false);
    const [ghostText, setGhostText] = useState("");

    const rootRef = useRef(null);
    const barRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => {
            setPhrase(prev => {
                let next = phrases[Math.floor(Math.random() * phrases.length)];
                if (phrases.length > 1 && next === prev) next = phrases[(phrases.indexOf(next) + 1) % phrases.length];
                return next;
            });
        }, 6000);
        return () => clearInterval(id);
    }, [phrases]);

    useEffect(() => {
        if (!rootRef.current || !barRef.current) return;
        const el = barRef.current;
        const root = rootRef.current;
        const apply = () => {
            const h = el.offsetHeight || 0;
            root.style.setProperty("--composer-h", `${h}px`);
        };
        apply();
        const ro = new ResizeObserver(apply);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const handleSubmit = () => {
        if (disabled) {
            toast.error("Загрузите для начала модель");
            return;
        }
        const text = value?.trim();
        if (!text) return;
        setGhostText(text);
        setSending(true);
        onSubmit?.(text);
    };

    return (
        <div
            ref={rootRef}
            className={`pd-newchat ${sending ? "is-sending" : ""}`}
        >
            <div
                key={phrase}
                className="pd-newchat__phrase"
            >
                {phrase}
            </div>
            {sending && (
                <div className="pd-newchat__ghost">
                    {ghostText}
                </div>
            )}
            <div
                className="pd-newchat__center"
                ref={barRef}
            >
                <ComposerBar
                    value={value}
                    onChange={onChange}
                    onSend={handleSubmit}
                    disabled={!value?.trim()}
                    placeholder="Спросите что-нибудь…"
                />
                {disabled && (
                    <div className="pd-newchat__hint">
                        Для начала загрузите модель
                    </div>
                )}
            </div>
        </div>
    );
};

export { NewChatDraft };
export default NewChatDraft;
