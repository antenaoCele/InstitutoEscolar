import { Link } from "react-router-dom";

export const DropdownItem = ({
  tag = "button",
  to,
  onClick,
  onItemClick,
  className = "",
  children,
  baseClassName = "...",
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();

  const handleClick = (event) => {
    if (tag === "button") {
      event.preventDefault();
    }

    onClick?.();
    onItemClick?.();
  };

  if (tag !== "button") {
    const Component = tag;

    return (
      <Component to={to} className={combinedClasses} onClick={handleClick}>
        {children}
      </Component>
    );
  }

  return (
    <button onClick={handleClick} className={combinedClasses}>
      {children}
    </button>
  );
};
