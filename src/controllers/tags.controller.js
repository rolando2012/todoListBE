import pool from "../db/connection.js";
import { decoratorTag, decoratorTagList } from "../decorators/tag.decorator.js";
import { validateStore, validateUpdate } from "../utils/validations/tags.validator.js";
import { uuidv7 } from "uuidv7";

export const store = async(req, res) => {
    try {
        const { isValid, message, errors } = validateStore(req.body || {});
        if(!isValid) return res.status(422).json({ message, errors });
        
        const { name } = req.body;
        const id = uuidv7();
        const cleanName = name.trim();
        const user_id = process.env.TEST_USER_ID;

        await pool.execute("INSERT INTO tags (id, name, user_id) VALUES (?,?,?)",
            [id, cleanName, user_id]
        );

        const tag = decoratorTag({id, name: cleanName, user_id });
        return res.status(201).json({ tag })
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const index = async(req,res) =>{
    try {
        const [tags] = await pool.execute(`SELECT tags.*, COUNT(tags_tasks.task_id) AS tasks_count
            FROM tags LEFT JOIN tags_tasks ON tags_tasks.tag_id = tags.id 
            GROUP BY tags.id ORDER BY tags.id`);
        const data = decoratorTagList(tags);
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const show = async(req,res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute(`SELECT tags.*, COUNT(tags_tasks.task_id) AS tasks_count 
            FROM tags LEFT JOIN tags_tasks ON tags.id = tags_tasks.tag_id 
            WHERE tags.id = ? GROUP BY tags.id`, [id]);
        if(rows.length === 0 ) return res.status(404).json({ message: "Etiqueta no encontrada"});
        const tag = decoratorTag(rows[0]);
        return res.status(200).json( tag );
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const update = async(req, res) => {
    try {
        const data = {id: req.params.id, ...req.body}
        const { isValid, message , errors } = validateUpdate(data);
        
        if(!isValid) return res.status(422).json({ message, errors });
        
        const [ result ] = await pool.execute("UPDATE tags SET name = ? WHERE id = ?",
            [data.name.trim(), data.id]
        );

        if(result.affectedRows === 0) return res.status(404).json({ message: "Etiqueta no encontrada"});

        const [ rows ] = await pool.execute("SELECT * FROM tags WHERE id = ?", [data.id]);
        const tag = decoratorTag(rows[0]);
        
        return res.status(200).json( tag );
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const destroy = async(req, res) => {
    try {
        const { id  } = req.params;
        const [rows] = await pool.execute("SELECT * FROM tags WHERE id = ?", [id]);
        if(rows.length === 0 ) return res.status(404).json({ message: "Etiqueta no encontrada"});

        await pool.execute("DELETE FROM tags WHERE id = ?", [id]);
        const tag = decoratorTag(rows[0]);
        return res.status(200).json({ message: "Etiqueta eliminada exitosamente", tag });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}