import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Empty } from "../components/ui/Empty.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";
import { date, money } from "../lib/format.js";

export function MyListingsPage() {
  const [items, setItems] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [deleting, setDeleting] = useState(null),
    [busy, setBusy] = useState(false);
  const { notify } = useContext(Session);
  const load = () =>
    api("/users/me/listings")
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);
  const status = async (item) => {
    setBusy(true);
    try {
      await api(`/listings/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: item.status === "sold" ? "available" : "sold",
        }),
      });
      await load();
      notify(
        item.status === "sold"
          ? "Your listing is available again."
          : "Marked as sold. Here’s to its next chapter!",
      );
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api(`/listings/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
      notify("Listing deleted.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page">
      <div className="section-heading">
        <div>
          <div className="eyebrow">YOUR LITTLE CORNER OF CAMPUS</div>
          <h1 className="page-title">My listings.</h1>
          <p className="muted">
            Manage your finds and make room for what’s next.
          </p>
        </div>
        <Link className="button primary" to="/sell">
          <Plus size={17} /> List an item
        </Link>
      </div>
      <div className="stats">
        <div>
          <strong>{items.length}</strong>
          <span>Total listings</span>
        </div>
        <div>
          <strong>
            {items.filter((l) => l.status === "available").length}
          </strong>
          <span>Available</span>
        </div>
        <div>
          <strong>{items.filter((l) => l.status === "sold").length}</strong>
          <span>Found a new home</span>
        </div>
      </div>
      {loading ? (
        <Skeleton />
      ) : error ? (
        <ErrorBox message={error} />
      ) : !items.length ? (
        <Empty
          title="Your next chapter starts here"
          text="List an item you no longer use. Someone nearby might love it."
          action={
            <Link className="button primary" to="/sell">
              Create your first listing
            </Link>
          }
        />
      ) : (
        <div className="my-listings">
          {items.map((item) => (
            <div className="my-listing" key={item.id}>
              <img src={item.image_path} alt={item.title} />
              <div className="my-listing-info">
                <span className={`status-label ${item.status}`}>
                  {item.status}
                </span>
                <h3>{item.title}</h3>
                <strong>{money(item.price)}</strong>
                <span className="muted"> · {date(item.created_at)}</span>
                {item.status === "hidden" && (
                  <p className="field-help">
                    Hidden by a moderator. Contact campus support for help.
                  </p>
                )}
              </div>
              <div className="listing-actions">
                <Link className="button ghost" to={`/listings/${item.id}/edit`}>
                  <Pencil size={15} /> Edit
                </Link>
                {item.status !== "hidden" && (
                  <button
                    className="button ghost"
                    disabled={busy}
                    onClick={() => status(item)}
                  >
                    <Check size={15} />
                    {item.status === "sold" ? "Relist" : "Mark sold"}
                  </button>
                )}
                <button
                  className="icon-button danger"
                  aria-label={`Delete ${item.title}`}
                  disabled={busy}
                  onClick={() => setDeleting(item)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {deleting && (
        <Modal title="Delete this listing?" close={() => setDeleting(null)}>
          <p className="muted">
            “{deleting.title}” and its reports will be permanently removed.
          </p>
          <div className="modal-actions">
            <button className="button ghost" onClick={() => setDeleting(null)}>
              Keep listing
            </button>
            <button
              className="button danger-button"
              disabled={busy}
              onClick={remove}
            >
              {busy ? <Spinner /> : "Delete listing"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
