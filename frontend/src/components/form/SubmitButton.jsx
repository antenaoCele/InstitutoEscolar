// Agregar Button (el componente)
export default function SubmitButton({ loading, text }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-brand-500 text-white py-2.5 hover:bg-brand-600 transition disabled:opacity-50"
    >
      {loading ? "Guardando..." : text}
    </button>
  );
}
