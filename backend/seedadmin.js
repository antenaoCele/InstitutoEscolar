import bcrypt from "bcrypt";
import { connectDB, db } from "./db.js";

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  throw new Error("Definí ADMIN_USERNAME y ADMIN_PASSWORD para crear el administrador");
}
try {
  await connectDB();
  const [admins] = await db.execute("SELECT id FROM users WHERE role = ? LIMIT 1", ["ADMIN"]);
  if (admins.length) {
    console.log("Ya existe un administrador");
  } else {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    await db.execute(
      "INSERT INTO users (username, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      [process.env.ADMIN_USERNAME, hash, "Admin", "Sistema", "ADMIN"],
    );
    console.log("Administrador creado");
  }
} finally {
  if (db) await db.end();
}
