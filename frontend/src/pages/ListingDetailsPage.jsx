import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, Flag, Mail, MapPin, Pencil, ShieldCheck } from "lucide-react";

import { Field } from "../components/ui/Field.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Loading } from "../components/ui/Loading.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";
import { date, money } from "../lib/format.js";

export function ListingDetailsPage() {
  const { id } = useParams(),
    { user, notify } = useContext(Session),
    navigate = useNavigate();
  const [item, setItem] = useState(null),
    [error, setError] = useState(""),
    [contact, setContact] = useState(null),
    [report, setReport] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setItem(null);
    setError("");
    setContact(null);
    api(`/listings/${id}`)
      .then(setItem)
      .catch((e) => setError(e.message));
  }, [id]);
  const getContact = async () => {
    if (!user)
      return navigate("/login", { state: { from: `/listings/${id}` } });
    setBusy(true);
    try {
      setContact(await api(`/listings/${id}/contact`));
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  const sendReport = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/reports", {
        method: "POST",
        body: JSON.stringify({
          listing_id: Number(id),
          reason: new FormData(e.currentTarget).get("reason"),
        }),
      });
      setReport(false);
      notify("Report submitted. A moderator will review it.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (error)
    return (
      <div className="container page">
        <ErrorBox message={error} />
        <Link to="/marketplace" className="text-link">
          Back to marketplace
        </Link>
      </div>
    );
  if (!item) return <Loading />;
  return (
    <div className="container page">
      <Link className="back-link" to="/marketplace">
        <ArrowLeft size={16} /> Back to all finds
      </Link>
      <div className="detail-layout">
        <div>
          <div className="detail-image">
            <img src={item.image_path} alt={item.title} />
            <span className="condition like-new">{item.condition}</span>
          </div>
          <div className="pickup-note">
            <MapPin size={20} />
            <div>
              <strong>Good finds, just a walk away.</strong>
              <span>
                Pick up at {item.hostel_name}, Block {item.block}
              </span>
            </div>
          </div>
        </div>
        <div className="detail-copy">
          <span className="eyebrow">
            {item.category} · LISTED {date(item.created_at)}
          </span>
          <h1>{item.title}</h1>
          <span className={`status-label ${item.status}`}>
            {item.status === "available"
              ? "Available for a new home"
              : "Sold — found a new home"}
          </span>
          <div className="detail-price">
            {money(item.price)}
            {item.original_price && <del>{money(item.original_price)}</del>}
          </div>
          <div className="detail-specs">
            <span>
              <strong>Condition</strong>
              {item.condition}
            </span>
            <span>
              <strong>Category</strong>
              {item.category}
            </span>
          </div>
          <h3>The details</h3>
          <p className="description">{item.description}</p>
          <div className="seller-box">
            <span className="avatar">{item.seller_name[0]}</span>
            <div>
              <strong>{item.seller_name}</strong>
              <span>
                <MapPin size={13} /> {item.hostel_name} · Block {item.block}
              </span>
            </div>
            <ShieldCheck size={22} />
          </div>
          {user?.id === item.seller_id ? (
            <Link
              className="button primary full"
              to={`/listings/${item.id}/edit`}
            >
              <Pencil size={17} /> Edit your listing
            </Link>
          ) : (
            <button
              className="button primary full"
              onClick={getContact}
              disabled={busy || item.status !== "available"}
            >
              {busy ? <Spinner /> : <Mail size={18} />} Contact seller
            </button>
          )}
          {contact && (
            <div className="contact-box">
              <strong>Say hello to {contact.name.split(" ")[0]}</strong>
              <a
                href={`mailto:${contact.email}?subject=${encodeURIComponent(`HostelSwap: ${item.title}`)}`}
              >
                {contact.email} <ArrowUpRight size={15} />
              </a>
              <p>
                Introduce yourself, arrange a campus pickup, and inspect the
                item before paying.
              </p>
            </div>
          )}
          <p className="safe-note">
            <ShieldCheck size={15} /> Meet on campus. Check the item. Pay when
            happy.
          </p>
          <button
            className="report-button"
            onClick={() =>
              user
                ? setReport(true)
                : navigate("/login", { state: { from: `/listings/${id}` } })
            }
          >
            <Flag size={14} /> Report this listing
          </button>
        </div>
      </div>
      {report && (
        <Modal
          title="Help keep the community safe"
          close={() => setReport(false)}
        >
          <p className="muted">
            Tell our moderators what seems wrong with this listing.
          </p>
          <form onSubmit={sendReport}>
            <Field label="Reason for reporting">
              <textarea
                name="reason"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="Please provide at least 10 characters of detail."
              />
            </Field>
            <button className="button primary full" disabled={busy}>
              {busy ? <Spinner /> : "Submit report"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
