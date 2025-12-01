import "./AkramFitDeletionModal.css";

import { Modal } from "react-bootstrap";
import { useEffect, useState } from "react";

import { AkramFitButton } from "shared/components/AkramFitButton";
import { AkramFitInput } from "shared/components/AkramFitInput/Index";

const AkramFitDeletionModal = ({
    show,
    loading = false,
    setShow,
    header = "Удаление",
    onSubmit,
    submit, // Старый prop для обратной совместимости
    className = ""
}) => {
    const [check, setCheck] = useState("");

    // Поддержка старого prop
    const handleSubmit = onSubmit || submit;

    useEffect(() => {
        setCheck("");
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={() => setShow(!show)}
            centered
            keyboard={false}
            dialogClassName={`akramfit-deletion-modal ${className}`}
            contentClassName="akramfit-deletion-modal__content"
            backdropClassName="akramfit-deletion-modal__backdrop"
        >
            <Modal.Header className="akramfit-deletion-modal__header">
                <div className="akramfit-deletion-modal__title">
                    {header}
                </div>
            </Modal.Header>

            <Modal.Body className="akramfit-deletion-modal__body">
                <div className="akramfit-deletion-modal__text">
                    Введите «УДАЛИТЬ» и нажмите «Удалить»
                </div>
                <AkramFitInput
                    value={check}
                    onChange={(e) => setCheck(e.target.value)}
                />
            </Modal.Body>

            <Modal.Footer className="akramfit-deletion-modal__footer">
                <AkramFitButton
                    className="akramfit-deletion-modal__button"
                    text="Отмена"
                    onClick={() => setShow(!show)}
                />
                <AkramFitButton
                    className="akramfit-deletion-modal__button akramfit-deletion-modal__button--delete"
                    text="Удалить"
                    disabled={check !== "УДАЛИТЬ"}
                    loading={loading}
                    onClick={(e) => {
                        e.preventDefault();
                        handleSubmit?.();
                    }}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default AkramFitDeletionModal;
