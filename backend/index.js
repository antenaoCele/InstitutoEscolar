import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import authRouter, { authConfig } from "./auth.js";

conectarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

authConfig();

app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});