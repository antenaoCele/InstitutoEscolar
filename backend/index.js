import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import authRouter, { authConfig } from "./auth.js";
import tutoresRouter from "./tutores.js";
import docentesRouter from "./docentes.js";

conectarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

authConfig();

app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);
app.use("/tutores", tutoresRouter);
app.use("/docentes", docentesRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});