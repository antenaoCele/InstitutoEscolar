import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";

export default function PlanForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:3000/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear el plan");
      }

      setSuccess("Plan creado correctamente");
      setName("");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ComponentCard title="Nuevo Plan">
      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <Label htmlFor="name">Nombre del Plan</Label>
          <Input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Plan Mensual"
            required
          />
        </div>

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
          {loading ? "Guardando..." : "Guardar Plan"}
        </button>

      </form>
    </ComponentCard>
  );
}