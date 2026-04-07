import { useState } from "react";

export default function useForm(initialValues) {
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al guardar");
      }

      setSuccess(true);
      setFormData(initialValues);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    loading,
    error,
    success,
  };
}
