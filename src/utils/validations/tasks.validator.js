import { buildErrorMessage } from "../format/formatErrors.js";

export const validateStore = (data = {}) => {
    const errors = {};
    const { title, description, category_id, state, tags, user_id } = data;

    if(!title || typeof title !== "string" || title.trim() === ""){
        errors.title = ["El titulo es obligatorio"];
    }else if(title.trim().length >50){
        errors.title = ["El titulo no debe exceder los 50 caracteres"];
    }

    if(!description || typeof description !== "string" || description.trim() === ""){
        errors.description = ["La descripción es obligatorio"];
    }else if(description.trim().length >50){
        errors.description = ["La descripción no debe exceder los 50 caracteres"];
    }

    if(category_id && category_id.trim().length !== 36){
        errors.category_id = ["El id de la categoria debe ser un UUID válido de 36 caracteres"];
    }

    if(state === undefined || state === null){
        errors.state = ["El estado es obligatorio"];
    }else if(typeof state !== "boolean"){
        errors.state = ["El estado debe ser booleano"];
    }

    if (tags !== undefined && tags !== null) {
        if (!Array.isArray(tags)) {
            errors.tags = ["Las etiquetas deben ser un arreglo de UUIDs"];
        } else {
            const hasInvalidTag = tags.some(
                tag => typeof tag !== "string" || tag.trim().length !== 36
            );
            if (hasInvalidTag) {
                errors.tags = ["Cada id de etiqueta debe ser un UUID válido de 36 caracteres"];
            }
        }
    }

    if(!user_id || typeof user_id !== "string" || user_id.trim() === ""){
        errors.user_id = ["El user_id es obligatorio"];
    }else if(user_id.trim().length !== 36){
        errors.user_id = ["El id debe ser un UUID válido de 36 caracteres"];
    }
    
    const isValid = Object.keys(errors).length === 0;
    
    return { isValid, message: isValid? "": buildErrorMessage(errors),  errors };
}