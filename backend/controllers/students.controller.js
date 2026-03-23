import { createCrudController } from "../utils/crudFactory.js";

export const studentsController = createCrudController("students");

/*
getByIdWithStatusPayments
obtener los datos del alumno ppor el id,
estado de la cuenta al dia de la fecha,
campo calculado, basandose en la fecha actual,
fecha de vencimiento del plan del mes en curso, monto del plan,
% de interes

claculateDiscount

planid studentId discountPercentage

buscas el plan
buscas el alumno
calculas el interes


con el precio del plan + interes
le descontas el %

return result
*/
