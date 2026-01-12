import express from "express";
import cors from "cors";
import { conectarDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import tutorsRouter from "./tutors.js";
import teachersRouter from "./teachers.js";
import subjectsRouter from "./subjects.js";
import usersRouter from "./users.js";



conectarDB();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

authConfig();

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/tutors", tutorsRouter);
app.use("/teachers", teachersRouter);
app.use("/subjects", subjectsRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});