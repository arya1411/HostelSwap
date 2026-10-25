import { Link } from "react-router-dom";
import { ArrowLeftRight, ArrowUpRight, Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div>
          <Link className="brand" to="/">
            <span className="brand-icon">
              <ArrowLeftRight size={21} />
            </span>
            Hostel<span>Swap</span>.
          </Link>
          <p>
            Your hostel’s marketplace.
            <br />
            Buy local. Sell smart.
          </p>
        </div>
        <div className="footer-links">
          <Link to="/marketplace">Explore marketplace</Link>
          <Link to="/help">Help & contact</Link>
          <Link to="/help#guidelines">Community guidelines</Link>
          <Link to="/sell">
            Start selling <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="footer-note">
          <Leaf size={18} />
          <span>
            A little less waste.
            <br />A lot more possibility.
          </span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} HostelSwap. Made for campus life.
        </span>
        <span>Good things deserve a second chapter.</span>
      </div>
    </footer>
  );
}
