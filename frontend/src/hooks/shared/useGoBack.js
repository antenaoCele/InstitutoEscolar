import { useNavigate } from "react-router-dom";

const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1); // vuelve atrás
    } else {
      navigate("/"); // va al home si no hay historial
    }
  };

  return goBack;
};

export default useGoBack;
