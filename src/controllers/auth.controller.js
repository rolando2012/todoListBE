import { uuidv7 } from "uuidv7";
import bcrypt from "bcrypt";
import pool from "../db/connection.js";
import { validateLogin, validateStore } from "../utils/validations/users.validator.js";
import { decoratorUser } from "../decorators/user.decator.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { isValid, message, errors } = validateStore(req.body || {});

        if(!isValid)return res.status(422).json({ message, errors });

        const {name, email, password} = req.body;
        const [result] = await pool.execute("SELECT email FROM users WHERE email = ?", [email]);
        if(result.length > 0) return res.status(422).json({ message: "El correo electrónico ya se encuentra registrado."});

        const idTexto = uuidv7();
        const passwordHash = await bcrypt.hash(password, 10);

        const query = "INSERT INTO users (id, name, email, password) VALUES (?,?,?,?)";
        await pool.execute(query, [idTexto, name, email, passwordHash]);

        const user = decoratorUser({ id: idTexto, name, email });

        const token = jwt.sign({id: idTexto}, process.env.JWT_SECRET);

        return res.status(201).json({ user, token, token_type: "Bearer" });
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }   
}

export const login = async (req, res) => {
    try {
        const {isValid, message, errors} = validateLogin(req.body || {});
        if(!isValid) return res.status(422).json({ message, errors });

        const { email, password } = req.body;
        const[result] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
        if(result.length === 0) return res.status(422).json({ message: "credenciales incorrectas" });

        const isMatch = await bcrypt.compare(password, result[0].password);
        if(!isMatch) return res.status(422).json({ message: "Credenciales incorrectas"});

        const user = decoratorUser(result[0]);
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);

        return res.status(200).json({ user, token, token_type: "Bearer"});
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}


export const logout = async(req, res) => {
    try {
        return res.status(200).json({ message: "Sesión cerrada exitosamente"});
    } catch (error) {
        return res.status(500).json({ message: "Ocurrió un error inesperado en el servidor. Inténtelo más tarde."});
    }
}