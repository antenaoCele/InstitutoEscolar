import { useState } from "react";

export default function useForm(initialValues, validate) {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: null,
    });
  };

  const handleSubmit = async (e, submitFn) => {
    e.preventDefault();

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
      const res = await submitFn(formData);

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
    setFormData,
    errors,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  };
}
