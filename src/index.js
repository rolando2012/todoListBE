import express from "express";
import morgan from "morgan";
import UsersRoutes from "./routes/users.routes.js";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json())
app.use(morgan("dev"));

app.get('/', (req, res) => res.send("Servidor corriendo"));

app.use("/api/users", UsersRoutes)

app.listen(PORT, () => {
    console.log(`Server corriendo  en http://localhost:${PORT}`);
});