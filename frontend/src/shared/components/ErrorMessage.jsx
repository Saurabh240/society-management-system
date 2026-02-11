export default function ErrorMessage({ message }) {
  return (
    <div className="p-4 text-red-600">
      {message || "Something went wrong"}
    </div>
  );
}
