import "./ProjectForm.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnsamblesServerSelect } from "shared/components/AnsamblesServerSelect";
import { AnsamblesServerInput } from "shared/components/AnsamblesServerInput/Index";
import { FileDropzone } from "adminView/projects/components/FileDropzone";
import { getProjects, returnProjects } from "states/Projects";

const ProjectForm = ({
    formData,
    setFormData,
    errors,
    setErrors,
    disabled = false,
    uploading = false,
    uploadProgress = null,
    onCancelUpload
}) => {
    const dispatch = useDispatch();
    const projects = useSelector(returnProjects) || [];

    useEffect(() => {
        if (!projects.length)
            dispatch(getProjects());
    }, [dispatch, projects.length]);

    const setField = (field, value) => {
        const next = { ...formData, [field]: value };
        if (field === "ifc_file" && value)
            next.ifc_library_file = null;
        setFormData(next);
        if (errors[field])
            setErrors({ ...errors, [field]: null });
    };

    const options = projects
        .filter(p => p?.hash && p?.file_name && p?.id)
        .map(({ hash, file_name, id }) => ({
            value: hash,
            label: `${file_name} | ${id}`,
            file_name,
            hash,
            projectId: id
        }));

    const selectedOption = formData?.ifc_library_file
        ? {
            value: formData.ifc_library_file.hash,
            label: `${formData.ifc_library_file.file_name} | ${formData.ifc_library_file.projectId}`,
            file_name: formData.ifc_library_file.file_name,
            hash: formData.ifc_library_file.hash,
            projectId: formData.ifc_library_file.projectId
        }
        : null;

    const handleSelectChange = (opt) => {
        const next = opt ? {
            file_name: opt.file_name,
            hash: opt.hash,
            projectId: opt.projectId
        } : null;

        const nextFormData = {
            ...formData,
            ifc_library_file: next,
            ifc_file: null
        };

        if (next?.file_name) {
            nextFormData.file_name = next.file_name;
        }

        setFormData(nextFormData);

        const nextErrors = { ...errors };
        if (nextErrors.ifc_library_file)
            nextErrors.ifc_library_file = null;
        if (nextErrors.ifc_file)
            nextErrors.ifc_file = null;
        setErrors(nextErrors);
    };

    const handleFileNameChange = (e) => {
        setField("file_name", e.target.value);
    };

    return (
        <div className="project-form__container">
            <div className="form-project-input-container">
                <AnsamblesServerInput
                    className="input"
                    disabled={disabled}
                    placeholder="Введите название проекта"
                    label="Название проекта"
                    error={errors?.name}
                    value={formData?.name || ""}
                    onChange={(e) => setField("name", e.target.value)}
                />
            </div>
            <div className="form-project-input-container">
                <AnsamblesServerInput
                    className="input"
                    disabled={disabled}
                    placeholder="Введите название файла"
                    label="Название файла"
                    error={errors?.file_name}
                    value={formData?.file_name || ""}
                    onChange={handleFileNameChange}
                />
            </div>
            <div className="form-project-input-container-bottom">
                <div className="form-project-input-container-left">
                    <FileDropzone
                        value={formData?.ifc_file || null}
                        onChange={(file) => {
                            const next = { ...formData, ifc_file: file };
                            if (file) {
                                next.ifc_library_file = null;
                                if (!formData?.file_name) {
                                    next.file_name = file.name;
                                }
                            }
                            setFormData(next);
                            if (errors.ifc_file) {
                                setErrors({ ...errors, ifc_file: null });
                            }
                        }}
                        onInvalid={(msg) => setErrors({ ...errors, ifc_file: msg })}
                        disabled={disabled}
                        accept=".ifc"
                        label="Загрузите новую IFC модель"
                        placeholderPrimary="Перетащите .ifc файл сюда"
                        placeholderSecondary="или"
                        actionText="нажмите для выбора"
                        ariaLabel="Загрузить IFC файл"
                        loading={uploading}
                        progress={typeof uploadProgress === "number" ? uploadProgress : null}
                        onCancel={onCancelUpload}
                    />
                </div>
                <div className="form-project-input-container-right">
                    <AnsamblesServerSelect
                        className="input"
                        disabled={disabled}
                        label="Выберите из существующих проектов"
                        placeholder="Выберите"
                        error={errors?.ifc_library_file}
                        isSearchable
                        options={options}
                        value={selectedOption}
                        onChange={handleSelectChange}
                    />
                </div>
                {errors?.ifc_file &&
                    <div className="error-text">
                        {errors.ifc_file}
                    </div>
                }
            </div>
        </div>
    );
};

export default ProjectForm;