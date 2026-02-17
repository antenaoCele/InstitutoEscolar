import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter, { authConfig } from "./auth.js";
import tutorsRouter from "./tutors.js";
import teachersRouter from "./teachers.js";
import subjectsRouter from "./subjects.js";
import usersRouter from "./users.js";
import studentsRouter from "./students.js";
import plan_subjectsRouter from "./plan_subjects.js";
import schedule_studentsRouter from "./schedule_students.js";
import student_plans from "./student_plans.js";
import schedulesRouter from "./schedules.js";
import plansRouter from "./plans.js";
import paymentsRouter from "./payments.js";
import teacher_subjectsRouter from "./teacher_subjects.js";
import student_TutorsRouter from "./student_tutors.js";

await connectDB();

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
app.use("/students", studentsRouter);
app.use("/plan_subjects", plan_subjectsRouter);
app.use("/schedule_students", schedule_studentsRouter);
app.use("/student_plans", student_plans);
app.use("/plans", plansRouter);
app.use("/payments", paymentsRouter);
app.use("/schedules", schedulesRouter);
app.use("/teacher_subjects", teacher_subjectsRouter);
app.use("/student_tutors", student_TutorsRouter);

app.listen(port, () => {
  console.log(`La aplicación está funcionando en el puerto ${port}`);
});
