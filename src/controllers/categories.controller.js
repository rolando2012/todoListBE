import pool from "../db/connection.js";
import { decoratorCategory, decoratorCategoryList } from "../decorators/category.decorator.js";
import { validateDestroy, validateStore, validateUpdate } from "../utils/validations/categories.validator.js";
import { uuidv7 } from "uuidv7";

export const store = async (req, res) => {
    try {
        const { isValid, message, errors } = validateStore(req.body || {});
        if(!isValid){
            return res.status(422).json({ message, errors});
        }

        const id = uuidv7();
        const {name, user_id} = req.body;
        const cleanName = name.trim();

        await pool.execute("INSERT INTO categories (id, name, user_id) VALUES (?,?,?)",
            [id,cleanName,user_id]
        );

        const category = decoratorCategory({id,name:cleanName,
            user_id, created_at: new Date().toISOString()});

        return res.status(201).json({ category });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const index = async(req, res) => {
    try {
        const [listCategories] = await pool.execute("SELECT * FROM categories");
        const data = decoratorCategoryList(listCategories);
        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
} 

export const show = async(req, res) => {
    try {
        const {id} = req.params;

        const [rows] = await pool.execute("SELECT * FROM categories WHERE id=?",[id]);
        if(rows.length === 0) return res.status(404).json({ message: "Categoría no encontrada" });
        const category = decoratorCategory(rows[0]);
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const update = async(req, res) => {
    try {
        const data = { id: req.params.id, ...req.body};

        const {isValid, message, errors } = validateUpdate(data || {});
        if(!isValid){
            return res.status(422).json({ message, errors });
        }

        const cleanName = data.name.trim();

        const [result] = await pool.execute("UPDATE categories SET name = ? WHERE id = ?", 
            [cleanName, data.id]);

        if(result.affectedRows === 0) return res.status(404).json({ message: "Categoria no encontrada" });
        
        const [rows] = await pool.execute("SELECT id, name, user_id, created_at, updated_at FROM categories WHERE id = ?",
            [data.id]);

        const category = decoratorCategory(rows[0]);
        return res.status(200).json( category );
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const destroy = async(req,res) => {
    try {
        const { id } = req.params;
        const { isValid, message, errors } = validateDestroy(id);
        if(!isValid) return res.status(422).json({ message, errors });
        const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ?", [id]);
        if(!rows) return res.status(404).json({ message: "Categoría no encontrada" });
        await pool.execute("DELETE FROM categories WHERE id = ?", [id]);
        const category = decoratorCategory(rows[0]);
        return res.status(200).json({ message: "Categoría elimianada exitosamente", category});
        
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."}); 
    }
}