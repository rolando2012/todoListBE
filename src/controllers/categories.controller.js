import pool from "../db/connection.js";
import { decoratorCategory, decoratorCategoryList } from "../decorators/category.decorator.js";
import { validateStore, validateUpdate } from "../utils/validations/categories.validator.js";
import { uuidv7 } from "uuidv7";
import { buildLaravelPaginator } from "../utils/format/paginate.js";

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

        const [existing] = await pool.execute("SELECT id FROM categories WHERE name = ? AND user_id = ?", [cleanName, user_id]);
        if (existing.length > 0) return res.status(422).json({message: "Ya tienes una categoría creada con este nombre." });
        
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
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const perPage = Math.max(1, parseInt(req.query.per_page, 10) || 15);
        const offset = (page - 1) * perPage;
        const [[{ total }]] = await pool.execute("SELECT COUNT(*) AS total FROM categories WHERE user_id = ?",[user_id]);
        const [categories] = await pool.execute(`SELECT categories.*, 
            (SELECT COUNT(*) FROM tasks WHERE tasks.category_id = categories.id AND tasks.user_id = ?) AS tasks_count
            FROM categories WHERE categories.user_id = ? ORDER BY categories.id 
            LIMIT ? OFFSET ?`, [user_id, user_id, String(perPage), String(offset)]);
        const decoratedData = decoratorCategoryList(categories)
        const response = buildLaravelPaginator({
            data: decoratedData,
            total,
            page,
            perPage,
            req
        });
        return res.status(200).json(response);
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
        const [existing] = await pool.execute("SELECT id FROM categories WHERE name = ? AND user_id = ? AND id != ?", [cleanName, user_id, data.id]);

        if (existing.length > 0) return res.status(422).json({ message: "Ya existe otra categoría con este nombre." });

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

        const [tasks] = await pool.execute("SELECT COUNT(*) AS count FROM tasks WHERE category_id = ? AND user_id = ?", [id, user_id]);

        if (tasks[0].count > 0) return res.status(422).json({ 
                message: "No se puede eliminar la categoría porque tiene tareas asociadas. Reasigna o elimina las tareas primero." });

        await pool.execute("DELETE FROM categories WHERE id = ? AND user_id = ?", [id, user_id]);
        const category = decoratorCategory(rows[0]);
        return res.status(200).json({ message: "Categoría elimianada exitosamente", category});
        
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."}); 
    }
}