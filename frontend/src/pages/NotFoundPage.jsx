import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container page narrow">
      <h1>Page not found</h1>
      <Link className="button primary" to="/">
        Back to home
      </Link>
    </div>
  );
}
