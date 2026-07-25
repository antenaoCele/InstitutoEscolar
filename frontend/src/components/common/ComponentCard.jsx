const ComponentCard = ({ title, children, className = "", desc = "" }) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-black ${className}`}
    >
      {(title || desc) && (
        <div className={desc ? "mb-6" : "mb-4"}>
          {title && (
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </h3>
          )}

          {desc && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
      )}

      {children}
    </div>
  );
};

export default ComponentCard;
