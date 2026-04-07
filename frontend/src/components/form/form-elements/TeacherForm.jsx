import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";

export default function TeacherForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dni: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:3000/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear docente");
      }

      setSuccess("Docente creado correctamente");

      setFormData({
        first_name: "",
        last_name: "",
        dni: "",
        phone: "",
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Nuevo Docente">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <Label htmlFor="first_name">Nombre</Label>
          <Input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="last_name">Apellido</Label>
          <Input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="dni">DNI</Label>
          <Input
            type="number"
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* feedback */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {success && (
          <p className="text-green-500 text-sm">{success}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-500 text-white py-2.5 hover:bg-brand-600 transition disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar Docente"}
        </button>

      </form>
    </ComponentCard>
  );
}