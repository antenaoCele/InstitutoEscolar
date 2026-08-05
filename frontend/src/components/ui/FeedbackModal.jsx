import { Modal } from "./Modal";

export default function FeedbackModal({ feedback, onClose }) {
  return (
    <Modal isOpen={feedback.open} onClose={onClose}>
      <h2
        className={`text-lg font-semibold mb-4 ${
          feedback.type === "error" ? "text-red-600" : "text-green-600"
        }`}
      >
        {feedback.type === "error" ? "Error" : "Listo"}
      </h2>

      <p className="text-gray-600">{feedback.message}</p>
    </Modal>
  );
}
