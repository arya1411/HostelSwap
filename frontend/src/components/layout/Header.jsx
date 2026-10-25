import { useState, useEffect, useContext, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowLeftRight, LogOut, Menu, Plus, Shield, X } from "lucide-react";

import { Session } from "../../context/SessionContext.js";

export function Header() {
  const { user, setUser, notify } = useContext(Session),
    [open, setOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef(null);
  const signOut = () => {
    sessionStorage.removeItem("hs_token");
    setUser(null);
    setOpen(false);
    notify("You’re signed out.");
  };
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  useEffect(() => setOpen(false), [location]);
  return (
    <header>
      <div className="container nav">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <ArrowLeftRight size={23} />
          </span>
          Hostel<span>Swap</span>
          <span className="brand-dot">.</span>
        </Link>
        <nav
          className={open ? "nav-links open" : "nav-links"}
          id="main-navigation"
          aria-label="Main navigation"
        >
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/marketplace">Explore marketplace</NavLink>
          <NavLink to="/help">How it works</NavLink>
          {user && <NavLink to="/my-listings">My listings</NavLink>}
          {user && (
            <div className="mobile-account">
              <NavLink to="/profile">Your profile</NavLink>
              {user.role === "admin" && <NavLink to="/admin">Moderation</NavLink>}
              <button onClick={signOut}><LogOut size={16} /> Sign out</button>
            </div>
          )}
        </nav>
        <div className="nav-actions">
          {user ? (
            <>
              <Link className="avatar" to="/profile" aria-label="Your profile">
                {user.name[0]}
              </Link>
              {user.role === "admin" && (
                <Link className="desktop-moderation" to="/admin" aria-label="Moderation">
                  <Shield size={20} />
                </Link>
              )}
              <button
                className="icon-button logout"
                aria-label="Sign out"
                onClick={signOut}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link className="login-link" to="/login">
              Log in
            </Link>
          )}
          <Link className="button primary sell-nav" to="/sell">
            <Plus size={17} /> Sell an item
          </Link>
          <button
            className="icon-button mobile-menu"
            ref={menuButton}
            aria-controls="main-navigation"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
