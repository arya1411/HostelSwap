import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Session } from "./SessionContext.js";

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [categories, setCategories] = useState([]);
  const notify = (message) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    api("/categories").then(setCategories).catch(() => {});
    const expire = () => {
      setUser(null);
      notify("Your session expired. Please sign in again.");
    };
    window.addEventListener("session-expired", expire);
    if (sessionStorage.getItem("hs_token")) {
      api("/auth/me")
        .then(setUser)
        .catch(() => sessionStorage.removeItem("hs_token"))
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
    return () => window.removeEventListener("session-expired", expire);
  }, []);

  return (
    <Session.Provider
      value={{ user, setUser, ready, notify, categories, toast, setToast }}
    >
      {children}
    </Session.Provider>
  );
}
