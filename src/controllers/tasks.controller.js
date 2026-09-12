import { uuidv7 } from "uuidv7";
import pool from "../db/connection.js";
import { validateStore } from "../utils/validations/tasks.validator.js";
import { decoradorTask } from "../decorators/tasks.decorator.js";

export const store = async(req, res) => {
    const connection = await pool.getConnection();
    try {
        const { isValid, message, errors } = validateStore(req.body || {});
        if(!isValid) return res.status(422).json({ message, errors });

        const id = uuidv7();
        const { title, description, state, category_id, tags, user_id } = req.body; 

        await connection.beginTransaction();

        await connection.execute(
            "INSERT INTO tasks (id, title, description, state, category_id, user_id) VALUES (?,?,?,?,?,?)",
            [id, title.trim(), description.trim(), state, category_id || null, user_id]
        );
        if(tags && tags.length > 0){
            const values = tags.map(tagId => [tagId, id]);
            await connection.query("INSERT INTO tags_tasks (tag_id, task_id) VALUES ?",
                [values]
            );
        }

        await connection.commit();

        const task = decoradorTask({ id, title: title.trim(), description: description.trim(), 
            state, category_id, user_id, tags});

        return res.status(201).json({ task })

    } catch (error) {
        await connection.rollback();
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}