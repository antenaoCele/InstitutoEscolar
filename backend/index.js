import cors from "cors";
import express from "express";
import passport from "passport";

import { configurePassport } from "./config/passport.js";
import { connectDB } from "./db.js";

import loginRouter from "./routes/login.routes.js";
import enrollmentsRouter from "./routes/enrollments.routes.js";
import eventsRouter from "./routes/events.routes.js";
import monthlyFinancesRouter from "./routes/monthly_finances.routes.js";
import paymentsRouter from "./routes/payments.routes.js";
import plansRouter from "./routes/plans.routes.js";
import planPricesRouter from "./routes/plan_prices.routes.js";
import planSubjectsRouter from "./routes/plan_subjects.routes.js";
import schedulesRouter from "./routes/schedules.routes.js";
import scheduleStudentsRouter from "./routes/schedule_students.routes.js";
import studentsRouter from "./routes/students.routes.js";
import studentPlansRouter from "./routes/student_plans.routes.js";
import studentTutorsRouter from "./routes/student_tutors.routes.js";
import subjectsRouter from "./routes/subjects.routes.js";
import teachersRouter from "./routes/teachers.routes.js";
import teacherLiquidationsRouter from "./routes/teacher_liquidations.routes.js";
import teacherSubjectsRouter from "./routes/teacher_subjects.routes.js";
import tutorsRouter from "./routes/tutors.routes.js";
import userRoutes from "./routes/user.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();
const port = 3000;

await connectDB();

configurePassport();
app.use(passport.initialize());

app.use(cors());
app.use(express.json());

app.use("/login", loginRouter);

app.use("/", userRoutes);

app.use("/enrollments", enrollmentsRouter);
app.use("/events", eventsRouter);
app.use("/monthly_finances", monthlyFinancesRouter);
app.use("/payments", paymentsRouter);
app.use("/plans", plansRouter);
app.use("/plan_prices", planPricesRouter);
app.use("/plan_subjects", planSubjectsRouter);
app.use("/schedules", schedulesRouter);
app.use("/schedule_students", scheduleStudentsRouter);
app.use("/students", studentsRouter);
app.use("/student_plans", studentPlansRouter);
app.use("/student_tutors", studentTutorsRouter);
app.use("/subjects", subjectsRouter);
app.use("/teachers", teachersRouter);
app.use("/teacher_liquidations", teacherLiquidationsRouter);
app.use("/teacher_subjects", teacherSubjectsRouter);
app.use("/tutors", tutorsRouter);
app.use("/users", usersRouter);

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION");
  console.error(err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION");
  console.error(err);
});
