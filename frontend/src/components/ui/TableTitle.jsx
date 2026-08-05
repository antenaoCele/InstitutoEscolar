export default function TableTitle({ title, action }) {
  return (
    <div className="flex justify-between items-center">
      <span>{title}</span>

      {action}
    </div>
  );
}
