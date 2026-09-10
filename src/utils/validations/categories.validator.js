import { buildErrorMessage } from "../format/formatErrors.js";

export const validateStore = (data = {}) => {
    const errors = {};
    const { name, user_id } = data;

    if(!name || typeof name !== "string" || name.trim() === ""){
        errors.name = ["El nombre es obligatorio"];
    }else if(name.trim().length >100){
        errors.name = ["El nombre no debe exceder los 100 caracteres"];
    }

    if(!user_id || typeof user_id !== "string" || user_id.trim() === ""){
        errors.user_id = ["El user_id es obligatorio"];
    }

    const isValid = Object.keys(errors).length === 0;

    return {isValid, message: buildErrorMessage(errors), errors };
}

export const validateUpdate = (data = {}) => {
    const baseResult = validateStore(data);
    const errors = {...baseResult.errors};
    const { id } = data;
    if (!id || typeof id !== "string" || id.trim() === "") {
        errors.id = ["El id de la categoría es obligatorio"];
    } else if (id.trim().length !== 36) {
        errors.id = ["El id debe ser un UUID válido de 36 caracteres"];
    }

    const isValid = Object.keys(errors).length === 0;

    return { isValid, message: isValid ? "" : buildErrorMessage(errors), errors };
}