import { Modal } from "../../components/ui/Modal";
import { isAdmin } from "../../utils/auth";

import useWeeklyCalendar from "../../hooks/pages/schedules/useWeeklyCalendar";

import WeeklyCalendarHeader from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarHeader";
import WeeklyCalendarGrid from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarGrid";
import WeeklyCalendarCreateModal from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarCreateModal";
import WeeklyCalendarEditModal from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarEditModal";
import WeeklyCalendarDeleteModal from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarDeleteModal";
import WeeklyCalendarInfoModal from "../../components/page-schedules/page-weeklyCalendar/WeeklyCalendarInfoModal";

const WeeklyCalendar = () => {
  const {
    teachers,
    students,
    schedules,
    scheduleStudents,
    filteredSchedules,

    selectedTeacher,
    selectedStudent,
    selectedClassroom,
    setSelectedTeacher,
    setSelectedStudent,
    setSelectedClassroom,

    openCreateModal,
    openEditModal,
    openDeleteModal,
    openInfoModal,

    selectedSchedule,
    selectedScheduleInfo,

    teacherId,
    selectedPlan,
    selectedDay,
    selectedTime,
    classroom,

    setSelectedPlan,
    setSelectedDay,
    setSelectedTime,
    setClassroom,

    selectedStudentId,
    selectedStudents,
    availableStudents,
    availablePlans,

    incompatibleStudents,
    setSelectedStudentId,

    errorsCreate,
    errorsEdit,

    days,
    classrooms,
    timeSlots,

    feedbackModal,
    closeFeedback,

    openCreate,
    handleCreate,
    handleEdit,
    handleUpdate,
    handleDelete,
    confirmDelete,
    handleInfo,

    handleAddStudent,
    handleRemoveStudent,

    handleTeacherChange,
    handlePlanChange,

    handleCloseCreateModal,
    handleCloseEditModal,
    handleCloseDeleteModal,
    handleCloseInfoModal,
  } = useWeeklyCalendar();

  return (
    <div className="p-4">
      <WeeklyCalendarHeader
        teachers={teachers}
        students={students}
        selectedTeacher={selectedTeacher}
        selectedStudent={selectedStudent}
        selectedClassroom={selectedClassroom}
        onTeacherChange={(e) => setSelectedTeacher(e.target.value)}
        onStudentChange={(value) => setSelectedStudent(value)}
        onClassroomChange={(value) => setSelectedClassroom(value)}
        onCreate={openCreate}
        isAdmin={isAdmin()}
      />

      <WeeklyCalendarGrid
        days={days}
        timeSlots={timeSlots}
        filteredSchedules={filteredSchedules}
        scheduleStudents={scheduleStudents}
        onInfo={handleInfo}
      />

      <WeeklyCalendarCreateModal
        isOpen={openCreateModal}
        onClose={handleCloseCreateModal}
        teachers={teachers}
        days={days}
        timeSlots={timeSlots}
        classrooms={classrooms}
        availablePlans={availablePlans}
        availableStudents={availableStudents}
        selectedStudents={selectedStudents}
        teacherId={teacherId}
        selectedDay={selectedDay}
        selectedTime={selectedTime}
        classroom={classroom}
        selectedPlan={selectedPlan}
        selectedStudentId={selectedStudentId}
        errors={errorsCreate}
        onTeacherChange={handleTeacherChange}
        onDayChange={setSelectedDay}
        onTimeChange={setSelectedTime}
        onClassroomChange={setClassroom}
        onPlanChange={handlePlanChange}
        onStudentChange={setSelectedStudentId}
        onAddStudent={handleAddStudent}
        onRemoveStudent={handleRemoveStudent}
        onCreate={handleCreate}
      />

      <WeeklyCalendarEditModal
        isOpen={openEditModal}
        onClose={handleCloseEditModal}
        teachers={teachers}
        days={days}
        timeSlots={timeSlots}
        classrooms={classrooms}
        availablePlans={availablePlans}
        availableStudents={availableStudents}
        selectedStudents={selectedStudents}
        incompatibleStudents={incompatibleStudents}
        teacherId={teacherId}
        selectedDay={selectedDay}
        selectedTime={selectedTime}
        classroom={classroom}
        selectedPlan={selectedPlan}
        selectedStudentId={selectedStudentId}
        errors={errorsEdit}
        onTeacherChange={handleTeacherChange}
        onDayChange={setSelectedDay}
        onTimeChange={setSelectedTime}
        onClassroomChange={setClassroom}
        onPlanChange={handlePlanChange}
        onStudentChange={setSelectedStudentId}
        onAddStudent={handleAddStudent}
        onRemoveStudent={handleRemoveStudent}
        onUpdate={handleUpdate}
      />

      <WeeklyCalendarDeleteModal
        isOpen={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDelete}
      />

      <WeeklyCalendarInfoModal
        isOpen={openInfoModal}
        onClose={handleCloseInfoModal}
        selectedScheduleInfo={selectedScheduleInfo}
        selectedSchedule={selectedSchedule}
        isAdmin={isAdmin()}
        onEdit={(schedule) => {
          handleCloseInfoModal();
          handleEdit(schedule);
        }}
        onDelete={(schedule) => {
          handleCloseInfoModal();
          handleDelete(schedule);
        }}
      />

      <Modal isOpen={feedbackModal.open} onClose={closeFeedback}>
        <h2
          className={`text-lg font-semibold mb-4 ${
            feedbackModal.type === "error" ? "text-red-600" : "text-green-600"
          }`}
        >
          {feedbackModal.type === "error" ? "Error" : "Listo"}
        </h2>

        <p className="text-gray-600">{feedbackModal.message}</p>
      </Modal>
    </div>
  );
};

export default WeeklyCalendar;
