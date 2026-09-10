import { buildErrorMessage } from "../format/formatErrors.js";

export const validateStore = (data = {}) => {
    const errors = {};
    const { name, user_id } = data;

    if(!name || typeof name !== "string" || name.trim() === ""){
        errors.name = ["El nombre es obligatorio"];
    }else if(name.trim().length >50){
        errors.name = ["El nombre no debe exceder los 50 caracteres"];
    }

    if(!user_id || typeof user_id !== "string" || user_id.trim() === ""){
        errors.user_id = ["El user_id es obligatorio"];
    }

    const isValid = Object.keys(errors).length === 0;

    return {isValid, message: buildErrorMessage(errors), errors };
}