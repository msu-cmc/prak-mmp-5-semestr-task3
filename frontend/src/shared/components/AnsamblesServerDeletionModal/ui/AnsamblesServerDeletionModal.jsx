import "./AnsamblesServerDeletionModal.css";

import { Modal } from "react-bootstrap";
import { useEffect, useState } from "react";

import { AnsamblesServerButton } from "shared/components/AnsamblesServerButton";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";

const AnsamblesServerDeletionModal = ({
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
                <AnsamblesServerInput
                    value={check}
                    onChange={(e) => setCheck(e.target.value)}
                />
            </Modal.Body>

            <Modal.Footer className="akramfit-deletion-modal__footer">
                <AnsamblesServerButton
                    className="akramfit-deletion-modal__button"
                    text="Отмена"
                    onClick={() => setShow(!show)}
                />
                <AnsamblesServerButton
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

export default AnsamblesServerDeletionModal;
