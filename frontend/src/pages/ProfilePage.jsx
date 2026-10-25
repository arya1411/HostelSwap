import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package } from "lucide-react";
import { Field } from "../components/ui/Field.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";
import { date } from "../lib/format.js";

export function ProfilePage() {
  const { user, setUser, notify } = useContext(Session),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const updated = await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      setUser(updated);
      notify("Profile updated.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page narrow">
      <div className="eyebrow">A FAMILIAR FACE ON CAMPUS</div>
      <h1 className="page-title">Your profile.</h1>
      <div className="profile-header">
        <span className="avatar large">{user.name[0]}</span>
        <div>
          <h2>{user.name}</h2>
          <p className="muted">Member since {date(user.created_at)}</p>
        </div>
      </div>
      <form className="form-panel" onSubmit={submit}>
        {error && <ErrorBox message={error} />}
        <Field label="Full name">
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={user.name}
          />
        </Field>
        <Field label="College email">
          <input value={user.email} disabled readOnly />
        </Field>
        <div className="two-fields">
          <Field label="Hostel name">
            <input
              name="hostel_name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={user.hostel_name}
            />
          </Field>
          <Field label="Block">
            <input
              name="block"
              required
              maxLength={50}
              defaultValue={user.block}
            />
          </Field>
        </div>
        <p className="field-help">
          Updating your profile won’t change existing listing pickup locations.
          Edit those individually in My Listings.
        </p>
        <button className="button primary full" disabled={busy}>
          {busy ? <Spinner /> : "Save profile"}
        </button>
      </form>
      <Link to="/my-listings" className="profile-listings">
        <Package size={22} />
        <span>View and manage your listings</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
