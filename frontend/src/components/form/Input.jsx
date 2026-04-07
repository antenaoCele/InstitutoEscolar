export default function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg px-3 py-2"
      />
    </div>
  );
}