import mysql from "mysql2/promise"

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "todolist2",
    port: process.env.DB_PORT || 3306
});

try {
    await pool.query("SELECT 1");
} catch (error) {
    process.exit(1);
}

export default pool;