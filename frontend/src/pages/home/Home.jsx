import { useEffect, useState } from "react";
import { DashboardService } from "../../services/dashboard.service";

import ComponentCard from "../../components/common/ComponentCard";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import { useAuth } from "../../context/Auth";

export const Home = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await DashboardService.getStats();
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <article className="p-6">
        <p>Cargando dashboard...</p>
      </article>
    );
  }

  if (!dashboard) {
    return (
      <article className="p-6">
        <p>No se pudo cargar la información.</p>
      </article>
    );
  }

  // El docente puede no tener un profesor asociado todavía.
  if (!dashboard.hasTeacher) {
    return (
      <article className="p-6">
        <p>{dashboard.message}</p>
      </article>
    );
  }

  const { cards, studentsByLevel, studentsByPlan, studentsPerTeacher } =
    dashboard.data;

  const isAdmin = user?.role === "ADMIN";

  return (
    <article className="space-y-6">
      {/* ===================== */}
      {/* TARJETAS */}
      {/* ===================== */}

      <div
        className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
          isAdmin ? "xl:grid-cols-5" : "xl:grid-cols-2"
        }`}
      >
        {isAdmin ? (
          <>
            <StatCard
              title="Alumnos activos"
              value={cards.students}
              color="text-blue-600"
            />

            <StatCard
              title="Planes pagados"
              value={cards.paidPlans}
              color="text-green-600"
            />

            <StatCard
              title="Planes pendientes"
              value={cards.pendingPlans}
              color="text-red-600"
            />

            <StatCard
              title="Cobrado este mes"
              value={`$ ${cards.moneyReceived.toLocaleString("es-AR")}`}
              color="text-emerald-600"
            />

            <StatCard
              title="Pendiente de cobro"
              value={`$ ${cards.moneyPending.toLocaleString("es-AR")}`}
              color="text-orange-600"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Alumnos activos"
              value={cards.students}
              color="text-blue-600"
            />

            <StatCard
              title="Clases hoy"
              value={cards.todaySchedules}
              color="text-red-600"
            />
          </>
        )}
      </div>

      {/* ===================== */}
      {/* GRAFICOS */}
      {/* ===================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ComponentCard title="Alumnos por nivel">
          <BarChartOne
            title="Cantidad"
            categories={studentsByLevel.map((item) => item.level)}
            data={studentsByLevel.map((item) => item.total)}
          />
        </ComponentCard>

        <ComponentCard title="Alumnos por plan">
          <BarChartOne
            title="Cantidad"
            categories={studentsByPlan.map((item) => item.name)}
            data={studentsByPlan.map((item) => item.total)}
          />
        </ComponentCard>
      </div>

      {isAdmin && (
        <ComponentCard title="Alumnos por docente">
          <BarChartOne
            title="Cantidad"
            categories={studentsPerTeacher.map((item) => item.teacher)}
            data={studentsPerTeacher.map((item) => item.total)}
            height={350}
          />
        </ComponentCard>
      )}
    </article>
  );
};

function StatCard({ title, value, color }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500">{title}</p>

      <h2 className={`mt-2 text-3xl font-bold ${color}`}>{value}</h2>
    </div>
  );
}
