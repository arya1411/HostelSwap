import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload } from "lucide-react";
import { Field } from "../components/ui/Field.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { Loading } from "../components/ui/Loading.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";

export function ListingFormPage({ edit = false }) {
  const { id } = useParams(),
    { user, categories, notify } = useContext(Session),
    navigate = useNavigate();
  const [item, setItem] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(""),
    [loaded, setLoaded] = useState(!edit);
  useEffect(() => {
    if (edit)
      api("/users/me/listings")
        .then((items) => {
          const l = items.find((l) => l.id === Number(id));
          if (!l)
            throw new Error(
              "This listing is unavailable or belongs to another student.",
            );
          setItem(l);
          setPreview(l.image_path);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoaded(true));
  }, [edit, id]);
  useEffect(
    () => () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    if (!data.get("image")?.size) data.delete("image");
    try {
      await api(edit ? `/listings/${id}` : "/listings", {
        method: edit ? "PUT" : "POST",
        body: data,
      });
      notify(
        edit
          ? "Your listing is updated."
          : "Your listing is live. Hello, new possibilities!",
      );
      navigate("/my-listings");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!loaded) return <Loading />;
  if (edit && !item)
    return (
      <div className="page container">
        <ErrorBox message={error} />
      </div>
    );
  return (
    <div className="container page form-page">
      <Link to="/my-listings" className="back-link">
        <ArrowLeft size={16} /> My listings
      </Link>
      <div className="eyebrow">GIVE GOOD THINGS A SECOND CHAPTER</div>
      <h1 className="page-title">
        {edit
          ? "A little update. A better find."
          : "Less clutter. More possibilities."}
      </h1>
      <p className="muted">
        {edit
          ? "Keep the details honest and up to date."
          : "A few details, one good photo, and you’re ready to sell."}
      </p>
      <form className="listing-form form-panel" onSubmit={submit}>
        {error && <ErrorBox message={error} />}
        <h3>
          01 <span>The good stuff</span>
        </h3>
        <Field label="Item name">
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            defaultValue={item?.title}
            placeholder="e.g. Casio scientific calculator"
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={5000}
            defaultValue={item?.description}
            rows={5}
            placeholder="Tell us about the item, what’s included, and any signs of wear."
          />
        </Field>
        <div className="two-fields category-fields">
          <Field label="Category">
            <select
              name="category_id"
              required
              defaultValue={item?.category_id || ""}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Condition">
            <select
              name="condition"
              required
              defaultValue={item?.condition || "Good"}
            >
              {["Like New", "Good", "Fair"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="two-fields">
          <Field label="Asking price (₹)">
            <input
              name="price"
              type="number"
              required
              min="1"
              step="0.01"
              max="10000000"
              defaultValue={item?.price}
              placeholder="650"
            />
          </Field>
          <Field label="Original price (₹, optional)">
            <input
              name="original_price"
              type="number"
              min="1"
              step="0.01"
              max="10000000"
              defaultValue={item?.original_price || ""}
              placeholder="1295"
            />
          </Field>
        </div>
        <h3>
          02 <span>Picture this</span>
        </h3>
        <label className="upload-area">
          {preview ? (
            <img src={preview} alt="Product preview" />
          ) : (
            <Upload size={32} />
          )}
          <strong>
            {preview ? "Choose a different photo" : "Add a photo of your item"}
          </strong>
          <span>JPEG, PNG or WebP · Up to 5 MB</span>
          <input
            aria-label="Product photo"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required={!edit}
            onChange={(e) => {
              const f = e.target.files[0];
              if (f && f.size > 5 * 1024 * 1024) {
                notify("Please choose an image smaller than 5 MB.");
                e.target.value = "";
                return;
              }
              if (f) setPreview(URL.createObjectURL(f));
            }}
          />
        </label>
        <h3>
          03 <span>A short walk away</span>
        </h3>
        <div className="two-fields">
          <Field label="Hostel name">
            <input
              name="hostel_name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={item?.hostel_name || user.hostel_name}
            />
          </Field>
          <Field label="Block / pickup location">
            <input
              name="block"
              required
              maxLength={50}
              defaultValue={item?.block || user.block}
            />
          </Field>
        </div>
        <p className="field-help">
          Your college email will be shared with signed-in buyers who contact
          you. Add accurate details and follow our{" "}
          <Link to="/help#guidelines">community guidelines</Link>.
        </p>
        <button className="button primary full" disabled={busy}>
          {busy ? <Spinner /> : edit ? "Save changes" : "Publish your listing"}
          {!busy && <ArrowRight size={17} />}
        </button>
      </form>
    </div>
  );
}
