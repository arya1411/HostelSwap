import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftRight, ArrowRight, ArrowUpRight, Leaf, Mail, MapPin, Search, ShieldCheck, ShoppingBag } from "lucide-react";
import { ListingCard } from "../components/listings/ListingCard.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Empty } from "../components/ui/Empty.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";

import { icons, labels } from "../constants/categories.js";

export function HomePage() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [active, setActive] = useState("");
  const { categories } = useContext(Session);
  const navigate = useNavigate();
  const categoryLink = (name) => {
    const category = categories.find((entry) => entry.name === name);
    return category ? `/marketplace?category_id=${category.id}` : "/marketplace";
  };
  useEffect(() => {
    let live = true;
    setLoading(true);
    api(`/listings?limit=8${active ? `&category_id=${active}` : ""}`)
      .then((d) => {
        if (!live) return;
        setItems(d.items);
        setError("");
      })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [active]);
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-dot" /> THE CAMPUS CIRCULAR <span className="hero-edition">BUY · SELL · PASS IT ON</span>
          </div>
          <h1>
            Good finds.
            <br />
            Right <span>next door.</span>
          </h1>
          <p>
            A book for this semester. A lamp for those all-nighters.
            <br className="desktop-break" /> Good stuff from students a few doors away.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/marketplace?q=${encodeURIComponent(query)}`);
            }}
          >
            <Search size={21} />
            <input
              aria-label="Search marketplace"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campus finds…"
            />
            <button type="submit" aria-label="Search">
              <ArrowRight size={22} />
            </button>
          </form>
          <div className="hero-proof">
            <MapPin size={17} />
            <span>Find it here. Pick it up on campus.</span>
            <Link to="/help" aria-label="Learn how HostelSwap works"><ArrowUpRight size={18} /></Link>
          </div>
        </div>
        <div className="campus-board">
          <div className="board-masthead"><span>THE GOOD STUFF BOARD</span><ArrowLeftRight size={19} /></div>
          <div className="board-listings">
            <Link className="board-feature" to={categoryLink("Textbooks")}>
              <div className="board-image"><img src="/demo/books.svg" alt="A stack of secondhand engineering textbooks" /><span className="board-sticker">NEXT<br />CHAPTER ↗</span></div>
              <div className="board-feature-copy"><span>FOR THE NEXT SEMESTER</span><h2>Same books.<br /><em>New beginnings.</em></h2><span className="board-discover">Browse textbooks <ArrowUpRight size={18} /></span></div>
            </Link>
            <div className="board-side">
              <Link className="board-small" to={categoryLink("Electronics")}><img src="/demo/headphones.svg" alt="Over-ear headphones" /><span>For your study playlist <ArrowUpRight size={15} /></span></Link>
              <div className="board-note"><span>A FRIENDLY REMINDER</span><p>Your “just lying around”<br />is someone’s<br /><em>“just what I needed.”</em></p><ArrowLeftRight size={24} /></div>
            </div>
          </div>
          <div className="board-bottom"><span>PRE-LOVED. STILL GOT PLENTY TO GIVE.</span><span>↓ TAKE A LOOK</span></div>
        </div>
      </section>
      <div className="benefit-strip">
        <div className="container benefit-inner">
          <span>
            <ShieldCheck />
            Your student community
          </span>
          <span>
            <MapPin />A short walk, not a shipping fee
          </span>
          <span>
            <Leaf />
            Good for your wallet. Better for the planet.
          </span>
        </div>
      </div>
      <section className="container category-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / THE SHORTCUTS</div>
            <h2>What’s on your list?</h2>
          </div>
          <Link className="text-link" to="/marketplace">
            Explore all categories <ArrowRight size={17} />
          </Link>
        </div>
        <div className="category-grid">
          {labels.map((name, i) => {
            const Icon = icons[i],
              cat = categories.find((c) => c.name === name);
            return (
              <Link
                key={name}
                className={`category category-${i}`}
                to={`/marketplace${cat ? `?category_id=${cat.id}` : ""}`}
              >
                <span className="category-icon">
                  <Icon size={27} strokeWidth={1.6} />
                </span>
                <strong>{name}</strong>
                <span>
                  Find your next <ArrowUpRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <section className="container finds-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">02 / THE LATEST LISTINGS</div>
            <h2>Just landed on the board.</h2>
            <p>
              Useful things, fair prices, familiar places.
            </p>
          </div>
          <Link className="text-link" to="/marketplace">
            View all listings <ArrowRight size={17} />
          </Link>
        </div>
        <div className="filter-pills">
          <button
            className={!active ? "selected" : ""}
            aria-pressed={!active}
            onClick={() => setActive("")}
          >
            All finds
          </button>
          {categories.slice(0, 4).map((c) => (
            <button
              key={c.id}
              className={active === c.id ? "selected" : ""}
              aria-pressed={active === c.id}
              onClick={() => setActive(c.id)}
            >
              {c.name}
            </button>
          ))}
          <span>
            <span className="tiny-dot" /> Available around you
          </span>
        </div>
        {loading ? (
          <Skeleton />
        ) : error ? (
          <ErrorBox message={error} />
        ) : items.length ? (
          <div className="product-grid">
            {items.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Empty
            title="A fresh start for this category"
            text="Be the first to list something useful."
          />
        )}
      </section>
      <section className="container sell-banner">
        <div>
          <span className="eyebrow">GOT SOMETHING TO PASS ON?</span>
          <h2>
            That thing you don’t use?
            <br />
            Someone on campus needs it.
          </h2>
          <p>
            Make a little room. Make a little money. Your first listing is free.
          </p>
          <Link className="button primary" to="/sell">
            List your first item <ArrowRight size={17} />
          </Link>
        </div>
        <div className="banner-doodle">
          <ShoppingBag size={110} strokeWidth={1} />
          <span className="doodle-plus">+</span>
          <span className="doodle-tag">
            Goodbye, clutter.
            <br />
            <strong>Hello, extra cash.</strong>
          </span>
        </div>
      </section>
      <section className="container how-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">
              03 / KEEP IT LOCAL
            </div>
            <h2>From your room to theirs.</h2>
          </div>
          <Link className="text-link" to="/help">
            Here’s how it works <ArrowRight size={17} />
          </Link>
        </div>
        <div className="how-grid">
          {[
            [
              Search,
              "Find your thing",
              "Discover useful finds from students in your hostel.",
            ],
            [
              Mail,
              "Say hello",
              "Sign in and connect with the seller by college email.",
            ],
            [
              ArrowLeftRight,
              "Meet. Swap. Sorted.",
              "Check it out, agree on a price, and pick up on campus.",
            ],
          ].map(([Icon, title, body], i) => (
            <div key={title}>
              <span className="step-number">0{i + 1}</span>
              <Icon size={25} />
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
