import { useEffect, useState } from "react";
import BasicTable from "../../components/tables/BasicTables/BasicTablesOne";
import { ScheduleService } from "../../services/Schedule.service";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

export function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorEdit, setErrorEdit] = useState("");

  // =========================
  // FETCH
  // =========================
  const fetchSchedules = async () => {
    try {
      const { data } = await ScheduleService.getAll();
      setSchedules(data?.data || []);
    } catch (error) {
      console.error("Error al obtener horarios:", error);
      setSchedules([]);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // =========================
  // EDITAR
  // =========================
  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setStartTime(schedule.start_time || "");
    setEndTime(schedule.end_time || "");
    setErrorEdit("");
    setOpenEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      setErrorEdit("");

      await ScheduleService.update(selectedSchedule.id, {
        start_time: startTime,
        end_time: endTime,
      });

      setOpenEditModal(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error al actualizar:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Error al actualizar";

      setErrorEdit(message);
    }
  };

  // =========================
  // ELIMINAR
  // =========================
  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setOpenDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await ScheduleService.delete(selectedSchedule.id);
      setOpenDeleteModal(false);
      fetchSchedules();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // =========================
  // COLUMNAS
  // =========================
  const columns = [
    { header: "ID", accessor: "id" },
    { header: "Hora Inicio", accessor: "start_time" },
    { header: "Hora Fin", accessor: "end_time" },
    {
      header: "Acciones",
      render: (row) =>
        isAdmin() ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleEdit(row)}>
              Editar
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(row)}
            >
              Eliminar
            </Button>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Sin permisos</span>
        ),
    },
  ];

  return (
    <>
      <BasicTable title="Horarios" columns={columns} data={schedules} />

      {/* ================= MODAL EDITAR ================= */}
      <Modal
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setErrorEdit("");
        }}
      >
        <h2 className="text-lg font-semibold mb-4">Editar Horario</h2>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Hora Inicio</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Hora Fin</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        {/* 🔥 ERROR */}
        {errorEdit && <p className="text-red-500 text-sm mb-3">{errorEdit}</p>}

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setOpenEditModal(false);
              setErrorEdit("");
            }}
          >
            Cancelar
          </Button>

          <Button onClick={handleUpdate} disabled={!startTime.trim() || !endTime.trim()}>
            Guardar
          </Button>
        </div>
      </Modal>

      {/* ================= MODAL ELIMINAR ================= */}
      <Modal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
      >
        <h2 className="text-lg font-semibold mb-4">¿Eliminar horario?</h2>

        <p className="text-gray-600 mb-4">Esta acción no se puede deshacer.</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
            Cancelar
          </Button>

          <Button onClick={confirmDelete}>Eliminar</Button>
        </div>
      </Modal>
    </>
  );
}