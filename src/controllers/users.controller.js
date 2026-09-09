import pool from "../db/connection.js";
import { validateStore } from "../utils/validations/users.validator.js";

export const store = async (req, res) => {
    const { isValid, message, errors } = validateStore(req.body || {});

    if(!isValid){
        return res.status(422).json({ message, errors });
    }

    return res.status(200).json({message: "datos correctos"});
}