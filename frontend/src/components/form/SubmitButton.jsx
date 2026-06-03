import Button from "../ui/Button";

export default function SubmitButton({ loading, text }) {
  return (
    <Button type="submit" disabled={loading} fullWidth>
      {loading ? "Ingresando..." : text}
    </Button>
  );
}
