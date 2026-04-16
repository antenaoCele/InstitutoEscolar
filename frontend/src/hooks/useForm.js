import { useState } from "react";

export default function useForm(initialValues, validate) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // limpia error del campo al escribir
    setErrors((prev) => ({
      ...prev,
      [name]: null,
    }));
  };

  const handleSubmit = async (e, submitFn) => {
    e.preventDefault();

    // 🔍 Validación frontend
    if (validate) {
      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 🚀 llamada al service
      const res = await submitFn(formData);

      // ⚠️ manejo de errores backend
      if (!res.success) {
        if (res.errors) {
          const backendErrors = {};
          res.errors.forEach((err) => {
            backendErrors[err.path] = err.msg;
          });
          setErrors(backendErrors);
        } else {
          setError(res.message);
        }
        return;
      }

      // ✅ éxito
      setSuccess(true);
      setFormData(initialValues);
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData, // 🔥 importante para edición dinámica
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  };
}
