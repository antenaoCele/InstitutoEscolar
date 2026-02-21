import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRouter, { authConfig } from "./routes/auth.js";
import tutorsRouter from "./routes/tutors.js";
import teachersRouter from "./routes/teachers.js";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import studentsRouter from "./routes/students.js";
import plan_subjectsRouter from "./routes/plan_subjects.js";
import schedule_studentsRouter from "./routes/schedule_students.js";
import student_plans from "./routes/student_plans.js";
import schedulesRouter from "./routes/schedules.js";
import plansRouter from "./routes/plans.js";
import paymentsRouter from "./routes/payments.js";
import teacher_subjectsRouter from "./routes/teacher_subjects.js";
import student_TutorsRouter from "./routes/student_tutors.js";
import teacher_liquidationsRouter from "./routes/teacher_liquidations.js";

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
app.use("/teacher_liquidations", teacher_liquidationsRouter);

app.listen(port, () => {
  console.log(`La aplicación está funcionando en el puerto ${port}`);
});
