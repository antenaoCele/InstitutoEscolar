import { twMerge } from "tailwind-merge";

export default function Label({ htmlFor, children, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        "mb-1.5 block text-sm font-medium text-black dark:text-white",
        className,
      )}
    >
      {children}
    </label>
  );
}
