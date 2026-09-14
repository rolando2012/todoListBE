import jwt from "jsonwebtoken";
import pool from "../db/connection.js";

export const verifyToken = async(req, res, next) =>{
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
    
        if(!token) return res.status(401).json({ message: "No autorizado. Token faltante."});

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [result] = await pool.execute("SELECT id FROM users WHERE id = ?", [decoded.id]);
        
        if(result.length === 0) return res.status(401).json({ message: "No autorizado. Usuario no encontrado."});

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Error No autorizado"});
    }
}