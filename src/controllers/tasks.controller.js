import { uuidv7 } from "uuidv7";
import pool from "../db/connection.js";
import { validateStore, validateUpdate } from "../utils/validations/tasks.validator.js";
import { decoradorTask, decoradorTaskList } from "../decorators/tasks.decorator.js";
import { buildLaravelPaginator } from "../utils/format/paginate.js";

export const store = async(req, res) => {
    const { isValid, message, errors } = validateStore(req.body || {});
    if(!isValid) return res.status(422).json({ message, errors });

    const { title, description, state, category_id, tags} = req.body;
    const user_id = req.user.id;
    if (category_id) {
        const [catCheck] = await pool.execute("SELECT id FROM categories WHERE id = ? AND user_id = ?", [category_id, user_id]);
        if (catCheck.length === 0) return res.status(422).json({ message: "La categoría especificada no es válida." });
    }
    if (tags && tags.length > 0) {
        const [userTags] = await pool.query("SELECT id FROM tags WHERE user_id = ? AND id IN (?)", [user_id, tags]);
        if (userTags.length !== tags.length) return res.status(422).json({ message: "Una o más etiquetas no son válidas." });
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
        const id = uuidv7(); 

        await connection.beginTransaction();
        transactionStarted = true;

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

        const [category] = await pool.execute(`SELECT categories.*,
                            (SELECT COUNT(*) FROM tasks WHERE tasks.category_id = categories.id) AS tasks_count
                            FROM categories WHERE categories.id = ? AND user_id = ?`, [category_id, user_id]);
        const [tagsRows] = await pool.query(`SELECT tags.*,
                            (SELECT COUNT(*) FROM tags_tasks WHERE tags_tasks.tag_id = tags.id) AS tasks_count
                            FROM tags WHERE tags.user_id = ? AND tags.id IN (?)
                            `, [user_id, tags]);

        const task = decoradorTask({ id, title: title.trim(), description: description.trim(), 
            state, category_id, category: category[0] ?? null, user_id, tags: tagsRows || []});

        return res.status(201).json({ task })

    } catch (error) {
        console.log(error);
        if(transactionStarted) await connection.rollback();
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    } finally {
        connection.release();
    }
}

export const index = async(req, res) => {
    try {
        const user_id = req.user.id;
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const perPage = Math.max(1, parseInt(req.query.perPage, 10) || 15);
        const offset = (page - 1) * perPage;
        const [[{ total }]] = await pool.execute("SELECT COUNT(*) AS total FROM tasks WHERE user_id = ?",[user_id]);
        if(total === 0) return res.status(200).json({ data:[], total: 0, page, perPage, req });
        
        const [tasks] = await pool.execute(`SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`, 
            [user_id, String(perPage), String(offset)]);

        const categoriesIds = [...new Set(tasks.map(t => t.category_id).filter(Boolean))];
        let mapCategories = new Map();

        if (categoriesIds.length > 0) {
            const [categories] = await pool.query(
                `SELECT categories.*, 
                    (SELECT COUNT(*) FROM tasks WHERE tasks.category_id = categories.id AND tasks.user_id = ?) AS tasks_count
                FROM categories 
                WHERE categories.user_id = ? AND categories.id IN (?)`,
                [user_id, user_id, categoriesIds]
            );
            mapCategories = new Map(categories.map(cat => [cat.id, cat]));
        }
    
        const tasksIds = tasks.map(t=>t.id);
        const [tags] = await pool.query(`
            SELECT tags_tasks.tag_id, tags_tasks.task_id, tags.name,
            (SELECT COUNT(*) FROM tasks WHERE tasks.id = tags_tasks.task_id) AS tasks_count
            FROM tags_tasks INNER JOIN tags ON tags_tasks.tag_id = tags.id
            WHERE tags.user_id = ? AND tags_tasks.task_id IN (?)
            `, [user_id, tasksIds]);

        const mapTags = new Map();
        tags.forEach( tag => {
            if(!mapTags.has(tag.task_id)) mapTags.set(tag.task_id, [])
            mapTags.get(tag.task_id).push(tag);
        });
        
        const mapTasks = tasks.map(task => ({...task, 
            category: mapCategories.get(task.category_id) ?? null, 
            tags: mapTags.get(task.id) ?? [] }));


        const decoratedData = decoradorTaskList(mapTasks);
        const response = buildLaravelPaginator({
            data: decoratedData,
            total,
            page,
            perPage,
            req
        });
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const show = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const [tasks] = await pool.execute(`SELECT * FROM tasks WHERE user_id = ? AND  id = ?`,[user_id, id]);
        if(tasks.length === 0) return res.status(404).json({ message: "Tarea no encontrada" });

        const [category] = await pool.execute(`SELECT categories.*,
                            (SELECT COUNT(*) FROM tasks WHERE categories.id = tasks.category_id) AS tasks_count
                            FROM categories WHERE categories.id = ? AND categories.user_id = ?`, 
                            [tasks[0].category_id, user_id]);
        
        const [tags] = await pool.execute(`SELECT tags.id, tags.name,
                            (SELECT COUNT(*) FROM tasks WHERE tasks.id = tags_tasks.task_id) AS tasks_count
                            FROM tags_tasks INNER JOIN tags ON tags_tasks.tag_id = tags.id
                            WHERE tags_tasks.task_id = ? AND tags.user_id = ?`, [id, user_id]);

        const categoryData = category[0]?? null;
        const data = decoradorTask({...tasks[0], category: categoryData, tags});
        return res.status(200).json( data ); 
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}; 

export const update = async (req, res) => {
    const data = { id: req.params.id, ...req.body };
    const { isValid, message, errors } = validateUpdate(data);
    if (!isValid) return res.status(422).json({ message, errors });

    const user_id = req.user.id;
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        const [taskCheck] = await connection.execute(
            "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
            [data.id, user_id]
        );
        if (taskCheck.length === 0) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        if (data.category_id) {
            const [catCheck] = await connection.execute(
                "SELECT id FROM categories WHERE id = ? AND user_id = ?",
                [data.category_id, user_id]
            );
            if (catCheck.length === 0) {
                return res.status(422).json({ message: "La categoría especificada no pertenece al usuario." });
            }
        }

        await connection.beginTransaction();
        transactionStarted = true;

        await connection.execute(
            `UPDATE tasks SET title=?, description=?, state=?, category_id=? 
            WHERE id=? AND user_id=?`,
            [data.title.trim(), data.description.trim(), data.state, data.category_id || null, data.id, user_id]
        );

        await connection.execute(`DELETE FROM tags_tasks WHERE task_id = ?`, [data.id]);

        if (data.tags && data.tags.length > 0) {
            const [userTags] = await connection.query(
                "SELECT id FROM tags WHERE user_id = ? AND id IN (?)",
                [user_id, data.tags]
            );
            if (userTags.length !== data.tags.length) {
                await connection.rollback();
                return res.status(422).json({ message: "Una o más etiquetas no pertenecen al usuario." });
            }

            const tagsValues = data.tags.map(tagId => [tagId, data.id]);
            await connection.query(`INSERT INTO tags_tasks (tag_id, task_id) VALUES ?`, [tagsValues]);
        }

        await connection.commit();

        const [updatedCategory] = data.category_id
            ? await pool.execute("SELECT * FROM categories WHERE id = ? AND user_id = ?", [data.category_id, user_id])
            : [[]];

        const [updatedTags] = data.tags && data.tags.length > 0
            ? await pool.query("SELECT * FROM tags WHERE user_id = ? AND id IN (?)", [user_id, data.tags])
            : [[]];

        const task = decoradorTask({
            id: data.id,
            title: data.title.trim(),
            description: data.description.trim(),
            state: data.state,
            category_id: data.category_id || null,
            category: updatedCategory[0] ?? null,
            tags: updatedTags,
            user_id
        });

        return res.status(200).json({ task });
    } catch (error) {
        if (transactionStarted) await connection.rollback();
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde." });
    } finally {
        connection.release();
    }
};

export const destroy = async(req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const [result] = await pool.execute(`SELECT * FROM tasks WHERE id = ? AND user_id = ?`,[id, user_id]);
        if(result.length === 0) return res.status(404).json({ message: "Tarea no encontrada" });

        const [category] = await pool.execute(`SELECT categories.*
                            FROM categories WHERE categories.id = ? AND user_id = ?`, [result[0].category_id, user_id]);
        const [tagsRows] = await pool.execute(`SELECT tags.id, tags.name
                            FROM tags_tasks INNER JOIN tags ON tags_tasks.tag_id = tags.id
                            WHERE tags_tasks.task_id = ? AND user_id = ?`, [id, user_id]);        
        await pool.execute(`DELETE FROM tasks WHERE id=? AND user_id=?`, [id, user_id]);
        
        const data = decoradorTask({...result[0], category: category[0], tags: tagsRows});
        
        return res.status(200).json({ message: "Tarea eliminada exitosamente", data })
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}