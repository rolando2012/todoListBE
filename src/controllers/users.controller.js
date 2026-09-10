import { uuidv7 } from "uuidv7";
import bcrypt from "bcrypt";
import pool from "../db/connection.js";
import { validateStore } from "../utils/validations/users.validator.js";

export const store = async (req, res) => {
    const { isValid, message, errors } = validateStore(req.body || {});

    if(!isValid){
        return res.status(422).json({ message, errors });
    }

    const {name, email, password} = req.body;

    const idTexto = uuidv7();
    const passwordHash = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (id, name, email, password) VALUES (?,?,?,?)";
    await pool.execute(query, [idTexto, name, email, passwordHash]);

    return res.status(201).json({user: { name: name, email: email }});
}