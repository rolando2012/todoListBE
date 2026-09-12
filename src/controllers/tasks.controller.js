import { uuidv7 } from "uuidv7";
import pool from "../db/connection.js";
import { validateStore, validateUpdate } from "../utils/validations/tasks.validator.js";
import { decoradorTask, decoradorTaskList, decoradorTaskSelect } from "../decorators/tasks.decorator.js";

export const store = async(req, res) => {
    const { isValid, message, errors } = validateStore(req.body || {});
    if(!isValid) return res.status(422).json({ message, errors });

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
        const id = uuidv7();
        const { title, description, state, category_id, tags, user_id } = req.body; 

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

        const task = decoradorTask({ id, title: title.trim(), description: description.trim(), 
            state, category_id, user_id, tags});

        return res.status(201).json({ task })

    } catch (error) {
        if(transactionStarted) await connection.rollback();
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    } finally {
        connection.release();
    }
}

export const index = async(req, res) => {
    try {
        const [result] = await pool.execute(`
            SELECT tasks.*, categories.name as category_name 
            FROM tasks 
            LEFT JOIN categories ON tasks.category_id = categories.id 
            ORDER BY tasks.id
            `);
        if(result.length === 0) return res.status(200).json({ data:[] });

        const tasksIds = result.map(t=>t.id);
        const [tags] = await pool.query(`
            SELECT tags_tasks.tag_id, tags_tasks.task_id, tags.name 
            FROM tags_tasks INNER JOIN tags ON tags_tasks.tag_id = tags.id
            WHERE tags_tasks.task_id IN (?)
            `, [tasksIds]);
        const mapTasks = new Map(result.map(task => [task.id, {...task, tags: []}]));

        tags.forEach(tag => {
            const task = mapTasks.get(tag.task_id);
            if(task) task.tags.push({id: tag.tag_id, name: tag.name});
        });

        const tasks = Array.from(mapTasks.values());
        const data = decoradorTaskList(tasks);

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}

export const show = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute(`SELECT tasks.*, categories.name as category_name
                            FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id 
                            WHERE tasks.id = ?`,[id]);
        if(result.length === 0) return res.status(404).json({ message: "Tarea no encontrada" });
        
        const [tags] = await pool.execute(`SELECT tags.id, tags.name
                            FROM tags_tasks INNER JOIN tags ON tags_tasks.tag_id = tags.id
                            WHERE tags_tasks.task_id = ?`, [id]);
        
        const data = decoradorTaskSelect({...result[0], tags});
        return res.status(200).json( data ); 
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}; 

export const update = async(req, res) => {
    const data = {id: req.params.id, ...req.body }
    const { isValid, message, errors } = validateUpdate(data);
    if(!isValid) return res.status(422).json({ message, errors });

    const connection = await pool.getConnection();
    let transactionStarted = false;
    try {
        await connection.beginTransaction();
        transactionStarted = true;
        const [result] = await connection.execute(`UPDATE tasks SET title=?, description=?, 
                state=?, category_id=? WHERE id=?`, [data.title.trim(), data.description.trim(), 
                    data.state, data.category_id || null, data.id]);
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        await connection.execute(`DELETE FROM tags_tasks WHERE task_id = ?`, [data.id]);
        if(data.tags && data.tags.length > 0){
            const tags = data.tags.map(tagId => [tagId, data.id]);
            await connection.query(`INSERT INTO tags_tasks (tag_id, task_id) VALUES ?`, [tags]);
        }

        await connection.commit();
        const task = decoradorTask({
            id: data.id,
            title: data.title.trim(),
            description: data.description.trim(),
            state: data.state,
            category_id: data.category_id || null,
            tags: data.tags || [],
            user_id: data.user_id
        });

        return res.status(200).json({ task }); 
    } catch (error) {
        if(transactionStarted) await connection.rollback();
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    } finally {
        connection.release();
    }
}
