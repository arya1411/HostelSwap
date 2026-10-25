export function ErrorBox({ message }) {
  return (
    <div className="error-box" role="alert">
      {message}
    </div>
  );
}
