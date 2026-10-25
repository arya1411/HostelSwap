import { useState, useEffect, useContext } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Field } from "../components/ui/Field.jsx";
import { Spinner } from "../components/ui/Spinner.jsx";
import { ErrorBox } from "../components/ui/ErrorBox.jsx";
import { Session } from "../context/SessionContext.js";
import { api } from "../lib/api.js";

export function AuthPage({ register = false }) {
  const { user, setUser, notify } = useContext(Session),
    navigate = useNavigate(),
    location = useLocation();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [domains, setDomains] = useState([]);
  useEffect(() => {
    api("/config")
      .then((d) => setDomains(d.collegeEmailDomains))
      .catch(() => {});
    setError("");
  }, [register]);
  if (user)
    return <Navigate to={location.state?.from || "/marketplace"} replace />;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      const result = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      sessionStorage.setItem("hs_token", result.token);
      setUser(result.user);
      notify(
        register ? "Welcome to your campus marketplace!" : "Welcome back!",
      );
      navigate(location.state?.from || "/marketplace", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container auth-layout">
      <div className="auth-story">
        <div className="eyebrow">GOOD THINGS HAPPEN LOCALLY</div>
        <h1>
          Your campus.
          <br />
          Your community.
          <br />
          <span>Your next find.</span>
        </h1>
        <p>
          A calculator for tomorrow’s exam. A lamp for late-night ideas. A
          second chapter for the things you love.
        </p>
        <img src="/demo/books.svg" alt="Colorful pre-loved textbooks" />
        <div>
          <ShieldCheck size={19} /> Built for students, around students.
        </div>
      </div>
      <div className="auth-form form-panel">
        <div className="eyebrow">
          {register ? "MAKE YOURSELF AT HOME" : "GOOD TO SEE YOU AGAIN"}
        </div>
        <h2>{register ? "Join your community." : "Welcome back."}</h2>
        <p className="muted">
          {register
            ? "Your next good find starts right here."
            : "Sign in to buy local and sell smart."}
        </p>
        <form onSubmit={submit} key={String(register)}>
          {error && <ErrorBox message={error} />}{" "}
          {register && (
            <Field label="Full name">
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                placeholder="Your name"
                autoComplete="name"
              />
            </Field>
          )}
          <Field label="College email">
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder={`you@${domains[0] || "college.edu"}`}
              autoComplete="email"
            />
          </Field>
          {register && domains.length > 0 && (
            <p className="field-help">Accepted domains: {domains.join(", ")}</p>
          )}
          <Field label="Password">
            <input
              name="password"
              type="password"
              required
              minLength={register ? 10 : 1}
              maxLength={72}
              placeholder={
                register ? "At least 10 characters" : "Your password"
              }
              autoComplete={register ? "new-password" : "current-password"}
            />
          </Field>
          {register && (
            <div className="two-fields">
              <Field label="Hostel name">
                <input
                  name="hostel_name"
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="e.g. Vindhya Hostel"
                />
              </Field>
              <Field label="Block">
                <input
                  name="block"
                  required
                  maxLength={50}
                  placeholder="e.g. A"
                />
              </Field>
            </div>
          )}
          <button className="button primary full" disabled={busy}>
            {busy ? <Spinner /> : register ? "Create your account" : "Sign in"}
            {!busy && <ArrowRight size={17} />}
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already part of the community?" : "New around here?"}{" "}
          <Link to={register ? "/login" : "/register"} state={location.state}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        {register && (
          <p className="field-help">
            By joining, you agree to our{" "}
            <Link to="/help#guidelines">community guidelines</Link>. Your
            college email is shared with signed-in buyers when they contact you.
          </p>
        )}
      </div>
    </div>
  );
}
