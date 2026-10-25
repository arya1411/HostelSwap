import { useContext } from "react";
import { CheckCircle2, X } from "lucide-react";
import { Session } from "../../context/SessionContext.js";

export function Toast() {
  const { toast, setToast } = useContext(Session);
  return (<>
        {toast && (
          <div className="toast" role="status">
            <CheckCircle2 size={20} />
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
  </>);
}
