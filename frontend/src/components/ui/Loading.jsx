import { Spinner } from "./Spinner.jsx";

export function Loading() {
  return (
    <div className="loading" role="status">
      <Spinner /> Finding the good stuff…
    </div>
  );
}
