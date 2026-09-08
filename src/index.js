import express from "express";
import morgan from "morgan";

const app = express();

const PORT = process.env.PORT || 4000;

app.use(morgan("dev"));

app.get('/', (req, res) => res.send("Servidor corriendo"));

app.listen(PORT, () => {
    console.log(`Server corriendo  en http://localhost:${PORT}`);
});