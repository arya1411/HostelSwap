import { useState, useEffect, useContext } from "react";
import { Loading } from "../components/ui/Loading.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Empty } from "../components/ui/Empty.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";
import { date } from "../lib/format.js";

export function AdminPage() {
  const [reports, setReports] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    { notify } = useContext(Session);
  const load = () =>
    api("/admin/reports")
      .then(setReports)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const moderate = async (r) => {
    setBusy(true);
    try {
      await api(`/admin/listings/${r.listing_id}/moderation`, {
        method: "PATCH",
        body: JSON.stringify({
          action: r.listing_status === "hidden" ? "restore" : "hide",
        }),
      });
      await load();
      notify("Listing moderation updated.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <div className="eyebrow">TAKING CARE OF THE COMMUNITY</div>
      <h1 className="page-title">Listing reports.</h1>
      <p className="muted">
        Review concerns and keep your campus marketplace welcoming.
      </p>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorBox message={error} />
      ) : !reports.length ? (
        <Empty title="All clear for now" text="New reports will appear here." />
      ) : (
        <div className="reports">
          {reports.map((r) => (
            <article className="form-panel" key={r.id}>
              <div className="section-heading">
                <h3>{r.title}</h3>
                <span className={`status-label ${r.listing_status}`}>
                  {r.listing_status}
                </span>
              </div>
              <p className="description">{r.reason}</p>
              <p className="muted">
                Reported by {r.reporter_name} · {date(r.created_at)} ·{" "}
                {r.status}
              </p>
              <button
                className="button ghost"
                disabled={busy}
                onClick={() => moderate(r)}
              >
                {r.listing_status === "hidden"
                  ? "Restore listing"
                  : "Hide listing"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
