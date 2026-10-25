import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

export function Modal({ title, close, children }) {
  const dialog = useRef(null);
  const closeRef = useRef(close);
  const titleId = useId();

  useEffect(() => { closeRef.current = close; }, [close]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const controls = () => Array.from(dialog.current.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.getClientRects().length);
    const handler = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== "Tab") return;
      const elements = controls();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.current.focus();
      } else if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handler);
    (controls()[0] || dialog.current).focus();
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" onClick={close}>
      <div
        ref={dialog}
        className="modal form-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close icon-button" aria-label="Close dialog" onClick={close}>
          <X size={20} />
        </button>
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
