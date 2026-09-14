import { buildErrorMessage } from "../format/formatErrors.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateStore = (data = {}) => {
    const errors = {};
    const { name, email, password } = data;

    if(!name || typeof name !== "string" || name.trim() === ""){
        errors.name = ["El nombre es obligatorio."];
    }else if(name.trim() > 255){
        errors.name = ["El nombre no debe exceder los 255 caracteres."];
    }

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

export const validateLogin = (data = {}) => {
    const errors = {};
    const { email, password } = data;

    if (!email || typeof email !== "string" || email.trim() === "") {
        errors.email = ["El correo electrónico es obligatorio."];
    } else if (!emailRegex.test(email.trim())) {
        errors.email = ["El formato del correo electrónico no es válido."];
    }

    if (!password || typeof password !== "string" || password.trim() === "") {
        errors.password = ["La contraseña es obligatoria."];
    }

    const isValid = Object.keys(errors).length === 0;
    return { isValid, message: buildErrorMessage(errors), errors };
}