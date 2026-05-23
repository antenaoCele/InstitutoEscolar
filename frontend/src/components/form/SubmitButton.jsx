import Button from "../ui/Button";

export default function SubmitButton({ loading, text }) {
  return (
    <Button type="submit" disabled={loading} className="w-full">
      {loading ? "Guardando..." : text}
    </Button>
  );
}
