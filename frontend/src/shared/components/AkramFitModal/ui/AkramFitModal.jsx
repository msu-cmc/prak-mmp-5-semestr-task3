import "./AkramFitModal.css";

import { Modal } from "react-bootstrap";

import { AkramFitButton } from "shared/components/AkramFitButton";

const AkramFitModal = ({
    show,
    loading = false,
    setShow,
    // Новые props
    title,
    content,
    onSubmit,
    submitText = "Выйти",
    cancelText = "Отмена",
    submitColor,
    // Старые props для обратной совместимости (WarningModal)
    warning,
    submit,
    buttonText,
    buttonColor,
    className = ""
}) => {
    // Поддержка старых props
    const modalContent = content || warning;
    const handleSubmit = onSubmit || submit;
    const submitButtonText = submitText || buttonText || "Выйти";
    const submitButtonColor = submitColor || buttonColor || "var(--red-color)";

    return (
        <Modal
            show={show}
            onHide={() => setShow(!show)}
            centered
            keyboard={false}
            dialogClassName={`akramfit-modal ${className}`}
            contentClassName="akramfit-modal__content"
            backdropClassName="akramfit-modal__backdrop"
        >
            {title && (
                <Modal.Header className="akramfit-modal__header">
                    <div className="akramfit-modal__title">
                        {title}
                    </div>
                </Modal.Header>
            )}

            <Modal.Body className="akramfit-modal__body">
                <div className="akramfit-modal__text">
                    {modalContent}
                </div>
            </Modal.Body>

            <Modal.Footer className="akramfit-modal__footer">
                <AkramFitButton
                    className="akramfit-modal__button"
                    onClick={() => setShow(!show)}
                    text={cancelText}
                />
                <AkramFitButton
                    loading={loading}
                    className="akramfit-modal__button akramfit-modal__button--submit"
                    style={{ backgroundColor: submitButtonColor }}
                    onClick={(e) => {
                        setShow(!show);
                        setTimeout(() => handleSubmit?.(e), 100);
                    }}
                    text={submitButtonText}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default AkramFitModal;
