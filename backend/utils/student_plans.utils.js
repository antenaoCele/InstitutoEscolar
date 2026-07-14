import { db } from "../db.js";

export async function isTeacherCompatibleWithPlan(teacher_id, plan_id) {
  const [compatible] = await db.execute(
    `
    SELECT 1
    FROM teacher_plans tp
    WHERE
      tp.teacher_id = ?
    AND tp.plan_id = ?
    LIMIT 1
    `,
    [teacher_id, plan_id],
  );

  return compatible.length > 0;
}
