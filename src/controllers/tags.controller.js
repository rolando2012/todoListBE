import pool from "../db/connection.js";
import { decoratorTag } from "../decorators/tag.decorator.js";
import { validateStore } from "../utils/validations/tags.validator.js";
import { uuidv7 } from "uuidv7";

export const store = async(req, res) => {
    try {
        const { isValid, message, errors } = validateStore(req.body || {});
        if(!isValid) return res.status(422).json({ message, errors });
        
        const { name, user_id } = req.body;
        const id = uuidv7();
        const cleanName = name.trim();

        await pool.execute("INSERT INTO tags (id, name, user_id) VALUES (?,?,?)",
            [id, cleanName, user_id]
        );
        const tag = decoratorTag({id, name: cleanName, user_id, 
            created_at: new Date().toISOString()});
        return res.status(201).json({ tag })
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
    


}