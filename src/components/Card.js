export function Card({ children, className = "" }) {
  return (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="text-white">{children}</div>;
}
