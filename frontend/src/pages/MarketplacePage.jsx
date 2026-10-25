import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "../components/listings/ListingCard.jsx";
import { Field } from "../components/ui/Field.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Empty } from "../components/ui/Empty.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";

export function MarketplacePage() {
  const location = useLocation(),
    navigate = useNavigate(),
    { categories } = useContext(Session);
  const params = new URLSearchParams(location.search);
  const [data, setData] = useState({ items: [], total: 0, pages: 0 }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(params.get("q") || ""),
    [filters, setFilters] = useState(false);
  const current = Object.fromEntries(params),
    page = Number(current.page) || 1;
  const appliedFilters = [
    ["q", current.q && `Search: ${current.q}`],
    ["category_id", current.category_id && (categories.find((category) => String(category.id) === current.category_id)?.name || "Category")],
    ["condition", current.condition],
    ["block", current.block && `Block ${current.block}`],
    ["min", current.min && `From ₹${current.min}`],
    ["max", current.max && `Up to ₹${current.max}`],
  ].filter(([, label]) => label);
  const update = (key, value) => {
    const p = new URLSearchParams(location.search);
    value ? p.set(key, value) : p.delete(key);
    if (key !== "page") p.delete("page");
    navigate(`/marketplace?${p}`);
  };
  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
    let live = true;
    setLoading(true);
    api(`/listings${location.search}`)
      .then((d) => {
        if (live) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [location.search]);
  return (
    <div className="container page">
      <div className="eyebrow">YOUR CAMPUS. YOUR FINDS.</div>
      <h1 className="page-title">
        Explore the marketplace<span className="brand-dot">.</span>
      </h1>
      <p className="muted">A new home for good things. A good deal for you.</p>
      <form
        className="market-search"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", query);
        }}
      >
        <Search size={21} />
        <input
          aria-label="Search items"
          placeholder="What are you looking for?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="button primary">Search</button>
      </form>
      <div className="market-layout">
        <aside id="marketplace-filters" className={`filters ${filters ? "filters-open" : ""}`}>
          <div className="filter-title">
            <h3>
              <SlidersHorizontal size={17} /> Filters
            </h3>
            <button
              className="text-link"
              onClick={() => navigate("/marketplace")}
            >
              Reset
            </button>
          </div>
          <Field label="Category">
            <select
              value={current.category_id || ""}
              onChange={(e) => update("category_id", e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price range (₹)">
            <div className="two-fields">
              <input
                type="number"
                aria-label="Minimum price"
                min="0"
                placeholder="Min"
                value={current.min || ""}
                onChange={(e) => update("min", e.target.value)}
              />
              <input
                type="number"
                aria-label="Maximum price"
                min="0"
                placeholder="Max"
                value={current.max || ""}
                onChange={(e) => update("max", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Condition">
            <select
              value={current.condition || ""}
              onChange={(e) => update("condition", e.target.value)}
            >
              <option value="">Any condition</option>
              {["Like New", "Good", "Fair"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Hostel block">
            <input
              aria-label="Hostel block"
              placeholder="e.g. A"
              maxLength={50}
              value={current.block || ""}
              onChange={(e) => update("block", e.target.value)}
            />
          </Field>
          <div className="filter-note">
            <ShieldCheck size={23} />
            <strong>A community you belong to.</strong>
            <p>
              Connect with students. Meet on campus. Keep good things going.
            </p>
          </div>
        </aside>
        <div className="results">
          <div className="results-bar">
            <span>
              <strong>{data.total}</strong>{" "}{data.total === 1 ? "find" : "finds"} around campus
            </span>
            <button
              className="button ghost filter-toggle"
              aria-expanded={filters}
              aria-controls="marketplace-filters"
              onClick={() => setFilters(!filters)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              aria-label="Sort listings"
              value={current.sort || "newest"}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
          {appliedFilters.length > 0 && (
            <div className="applied-filters" aria-label="Applied filters">
              {appliedFilters.map(([key, label]) => (
                <button key={key} onClick={() => update(key, "")} aria-label={`Remove ${label} filter`}>
                  <span>{label}</span><X size={12} />
                </button>
              ))}
              <button className="clear-all" onClick={() => navigate("/marketplace")}>Clear all</button>
            </div>
          )}
          {loading ? (
            <Skeleton />
          ) : error ? (
            <ErrorBox message={error} />
          ) : data.items.length ? (
            <div className="product-grid market-products">
              {data.items.map((item) => (
                <ListingCard item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <Empty
              title="No finds just yet"
              text="Try a different search or clear a few filters."
              action={
                <button
                  className="button primary"
                  onClick={() => navigate("/marketplace")}
                >
                  Clear filters
                </button>
              }
            />
          )}{" "}
          {!loading && !error && data.pages > 1 && (
            <div className="pagination">
              <button
                className="button ghost"
                disabled={page <= 1}
                onClick={() => update("page", String(page - 1))}
              >
                <ArrowLeft size={16} /> Previous
              </button>
              <span>
                Page {page} of {data.pages}
              </span>
              <button
                className="button ghost"
                disabled={page >= data.pages}
                onClick={() => update("page", String(page + 1))}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
