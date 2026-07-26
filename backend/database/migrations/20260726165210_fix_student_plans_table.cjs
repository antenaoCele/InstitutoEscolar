exports.up = async function (knex) {
  await knex.schema.alterTable("student_plans", (table) => {
    // Nullable a propósito: solo tiene sentido en el momento de la
    // creación del plan (define cómo arranca el primer período de pago).
    // Las filas históricas no necesitan un valor acá; el validador de
    // creación (a nivel de Express) va a exigirlo para los planes nuevos.
    table.enu("first_payment_option", ["FULL", "HALF", "NEXT_MONTH"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("student_plans", (table) => {
    table.dropColumn("first_payment_option");
  });
};
