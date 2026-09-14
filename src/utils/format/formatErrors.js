export const buildErrorMessage = (errors = {}) => {
    const fieldKeys = Object.keys(errors);
    const totalErrors = fieldKeys.length;

    if (totalErrors === 0) return "";

    const firstErrorMessage = errors[fieldKeys[0]][0];
    const remaining = totalErrors - 1;

    if (remaining === 0) {
        return firstErrorMessage;
    }

    const suffix = remaining === 1 ? "error más" : "errores más";
    return `${firstErrorMessage} (y ${remaining} ${suffix})`;
};