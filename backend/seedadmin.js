// seedAdmin.js
import bcrypt from "bcrypt";
import { db } from "./db.js";

async function seedAdmin() {
  const [admins] = await db.execute(
    "SELECT * FROM users WHERE rol = 'ADMIN'"
  );

  if (admins.length === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.execute(
      "INSERT INTO users (username, password, first_name, rol) VALUES (?, ?, ?, 'ADMIN')",
      ["admin", hashedPassword, "Admin"]
    );

    console.log("Admin creado correctamente");
  } else {
    console.log("Ya existe un admin");
  }
}

seedAdmin();
