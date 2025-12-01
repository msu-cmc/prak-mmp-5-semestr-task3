import "./AnsamblesServerAddImages.css";

import { useRef } from "react";

import { ReactComponent as UploadIcon } from "shared/assets/items/AddFile.svg";

const AnsamblesServerAddImages = ({
    id = "akramfit-input-image",
    disabled = false,
    multiple = false,
    onFilesSelected,
    className = "",
    title = "Загрузить фото",
    accept = "image/*",
    style,
    ...rest
}) => {
    const btnClass = `akramfit-add-images ${className}`.trim();
    const inputRef = useRef(null);

    const handleChange = (e) => {
        if (onFilesSelected)
            onFilesSelected(e.target.files);
        e.target.value = "";
    };

    return (
        <label
            htmlFor={id}
            className={btnClass}
            title={title}
            style={style}
            {...rest}
        >
            <UploadIcon className="akramfit-add-images__icon" />
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                hidden
                onChange={handleChange}
            />
        </label>
    );
};

export default AnsamblesServerAddImages;