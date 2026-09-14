import { buildErrorMessage } from "../format/formatErrors.js";

export const validateStore = (data = {}) => {
    const errors = {};
    const { name, email, password } = data;

    if(!name || typeof name !== "string" || name.trim() === ""){
        errors.name = ["El nombre es obligatorio."];
    }else if(name.trim() > 255){
        errors.name = ["El nombre no debe exceder los 255 caracteres."];
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || email.trim() === "" ){
        errors.email = ["El correo electrónico es obligatorio"];
    }else if (!emailRegex.test(email.trim())) {
        errors.email = ["El formato del correo electrónico no es válido"];
    }

    if(!password || typeof password !== "string"){
        errors.password = ["La contraseña es obligatoria"];
    }else if (password.length < 8){
        errors.password = ["La contraseña debe tener al menos 8 caracteres"];
    }

    const isValid = Object.keys(errors).length === 0;

    return {isValid, message: buildErrorMessage(errors), errors };
}