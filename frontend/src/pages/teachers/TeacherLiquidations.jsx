import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import Button from "../../components/ui/Button";
import ComponentCard from "../../components/common/ComponentCard";
import { teacherLiquidationService } from "../../services/teacherLiquidation.service";

export default function TeacherLiquidations() {
  // ======================================================
  // DATOS
  // ======================================================
  const [liquidations, setLiquidations] = useState([]);

  // ======================================================
  // FILTRO DE MES / AÑO
  // ======================================================
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // ======================================================
  // FETCH DATOS
  // ======================================================
  const fetchLiquidations = async () => {
    try {
      const { data } = await teacherLiquidationService.getMonthly(month, year);

      setLiquidations(data.data || []);
    } catch (error) {
      console.error(error);
      setLiquidations([]);
    }
  };

  useEffect(() => {
    fetchLiquidations();
  }, [month, year]);

  // ======================================================
  // NAVEGACIÓN DE MES
  // ======================================================
  const previousMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  // ======================================================
  // TOTALES
  // ======================================================
  const totalCollected = liquidations.reduce(
    (acc, l) => acc + Number(l.total_collected),
    0,
  );

  const totalNetSalary = liquidations.reduce(
    (acc, l) => acc + Number(l.net_salary),
    0,
  );

  // ======================================================
  // COLUMNAS DE TABLA
  // ======================================================
  const columns = [
    {
      header: "Docente",
      render: (row) => `${row.last_name}, ${row.first_name}`,
    },
    {
      header: "Mes",
      render: () => `${monthNames[month - 1]} ${year}`,
    },
    {
      header: "Total recaudado",
      render: (row) =>
        `$${Number(row.total_collected).toLocaleString("es-AR")}`,
    },
    {
      header: "Sueldo neto",
      render: (row) => `$${Number(row.net_salary).toLocaleString("es-AR")}`,
    },
  ];

  const tableTitle = (
    <div className="flex justify-between items-center">
      <span>Liquidaciones de docentes</span>
    </div>
  );

  // ======================================================
  // RETURN
  // ======================================================
  return (
    <>
      {/* ---------- Navegación de mes ---------- */}
      <div className="flex justify-center items-center gap-4 mb-6">
        <Button onClick={previousMonth}>◀</Button>

        <h2 className="text-xl font-bold">
          {monthNames[month - 1]} {year}
        </h2>

        <Button onClick={nextMonth}>▶</Button>
      </div>

      {/* ---------- Totales ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <ComponentCard title="Liquidaciones registradas">
          <p className="text-2xl font-bold">{liquidations.length}</p>
        </ComponentCard>

        <ComponentCard title="Total recaudado">
          <p className="text-2xl font-bold">
            ${totalCollected.toLocaleString("es-AR")}
          </p>
        </ComponentCard>

        <ComponentCard title="Total sueldos netos">
          <p className="text-2xl font-bold">
            ${totalNetSalary.toLocaleString("es-AR")}
          </p>
        </ComponentCard>
      </div>

      {/* ---------- Tabla ---------- */}
      <BasicTable title={tableTitle} columns={columns} data={liquidations} />
    </>
  );
}
