import { useState } from "react";

export const useFeedbackModal = () => {
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    type: "error",
    message: "",
  });

  const showFeedback = (message, type = "error") =>
    setFeedbackModal({ open: true, type, message });

  const closeFeedback = () =>
    setFeedbackModal((prev) => ({ ...prev, open: false }));

  return { feedbackModal, showFeedback, closeFeedback };
};
