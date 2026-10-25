import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin } from "lucide-react";
import { Session } from "../../context/SessionContext.js";
import { date, money } from "../../lib/format.js";

export function ListingCard({ item }) {
  const readSaved = () => {
    try {
      const value = JSON.parse(localStorage.getItem("hs_saved") || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };
  const [saved, setSaved] = useState(() => readSaved().includes(item.id));
  const { notify } = useContext(Session);
  const toggle = () => {
    const ids = readSaved();
    const nextSaved = !ids.includes(item.id);
    try {
      localStorage.setItem("hs_saved", JSON.stringify(
        nextSaved ? [...ids, item.id] : ids.filter((id) => id !== item.id),
      ));
      setSaved(nextSaved);
      notify(nextSaved ? "Saved on this device." : "Removed from saved finds.");
    } catch {
      notify("Your browser could not save this find. Check your storage settings.");
    }
  };
  return (
    <article className="product-card">
      <div className="product-media">
        <Link to={`/listings/${item.id}`} className="product-image">
          <img src={item.image_path} alt={item.title} loading="lazy" />
          <span
            className={`condition ${item.condition === "Like New" ? "like-new" : ""}`}
          >
            {item.condition}
          </span>
          {item.status !== "available" && (
            <span className="status-overlay">{item.status}</span>
          )}
        </Link>
        <button
          className={`save-button ${saved ? "saved" : ""}`}
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Unsave listing" : "Save listing"}
          onClick={toggle}
        >
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-info">
        <span className="product-category">{item.category}</span>
        <Link to={`/listings/${item.id}`}>
          <h3>{item.title}</h3>
        </Link>
        <div className="price">
          {money(item.price)}
          {item.original_price && <del>{money(item.original_price)}</del>}
        </div>
        <div className="product-location">
          <MapPin size={13} />
          {item.hostel_name} · Block {item.block}
        </div>
        <div className="product-seller">
          <span className="mini-avatar">{item.seller_name?.[0]}</span>
          <span>{item.seller_name}</span>
          <time dateTime={item.created_at}>{date(item.created_at)}</time>
        </div>
      </div>
    </article>
  );
}
