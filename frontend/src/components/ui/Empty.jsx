import { ShoppingBag } from "lucide-react";

export function Empty({ title, text, action }) {
  return (
    <div className="empty">
      <ShoppingBag size={40} strokeWidth={1.3} />
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
