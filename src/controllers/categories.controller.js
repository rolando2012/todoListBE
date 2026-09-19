import pool from "../db/connection.js";
import { decoratorCategory, decoratorCategoryList } from "../decorators/category.decorator.js";
import { validateStore, validateUpdate } from "../utils/validations/categories.validator.js";
import { uuidv7 } from "uuidv7";

export const store = async (req, res) => {
    try {
        const { isValid, message, errors } = validateStore(req.body || {});
        if(!isValid){
            return res.status(422).json({ message, errors});
        }

        const id = uuidv7();
        const {name} = req.body;
        const cleanName = name.trim();
        const user_id = req.user.id;

        await pool.execute("INSERT INTO categories (id, name, user_id) VALUES (?,?,?)",
            [id,cleanName,user_id]
        );

        const category = decoratorCategory({id, name:cleanName, user_id});

        return res.status(201).json({ category });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const index = async(req, res) => {
    try {
        const user_id = req.user.id;
        const [categories] = await pool.execute(`SELECT categories.*, 
            (SELECT COUNT(*) FROM tasks WHERE tasks.category_id = categories.id AND tasks.user_id = ?) AS tasks_count
            FROM categories WHERE categories.user_id = ?`, [user_id, user_id]
        );
        const data = decoratorCategoryList(categories);
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
} 

export const show = async(req, res) => {
    try {
        const {id} = req.params;
        const user_id = req.user.id;

        const [categories] = await pool.execute(`SELECT categories.*, 
            (SELECT COUNT(*) FROM tasks WHERE tasks.category_id = categories.id AND tasks.user_id = ?) AS tasks_count
            FROM categories 
            WHERE categories.id = ? AND categories.user_id = ?`, [user_id, id, user_id]
        );
        if(categories.length === 0) return res.status(404).json({ message: "Categoría no encontrada" });

        const category = decoratorCategory(categories[0]);
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const update = async(req, res) => {
    try {
        const data = { id: req.params.id, ...req.body};
        const user_id = req.user.id;

        const {isValid, message, errors } = validateUpdate(data || {});
        if(!isValid){
            return res.status(422).json({ message, errors });
        }

        const cleanName = data.name.trim();
        const [result] = await pool.execute("UPDATE categories SET name = ? WHERE id = ? AND user_id = ?", 
            [cleanName, data.id, user_id]);

        if(result.affectedRows === 0) return res.status(404).json({ message: "Categoria no encontrada" });
        
        const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ? AND user_id = ?",
            [data.id, user_id]);

        const category = decoratorCategory(rows[0]);
        return res.status(200).json( category );
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const destroy = async(req,res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ? AND user_id = ?", [id, user_id]);
        if(rows.length === 0) return res.status(404).json({ message: "Categoría no encontrada" });

        await pool.execute("DELETE FROM categories WHERE id = ? AND user_id = ?", [id, user_id]);
        const category = decoratorCategory(rows[0]);
        return res.status(200).json({ message: "Categoría elimianada exitosamente", category});
        
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."}); 
    }
}