import { Link } from "react-router-dom";
import { ArrowRight, Search, ShieldCheck, ShoppingBag } from "lucide-react";

export function HelpPage() {
  return (
    <div className="container page help-page">
      <div className="eyebrow">A BETTER WAY TO BUY AND SELL ON CAMPUS</div>
      <h1 className="page-title">Good swaps start here.</h1>
      <p className="lead muted">
        Your hostel’s marketplace. Buy local. Sell smart.
      </p>
      <div className="help-grid">
        <article className="form-panel">
          <Search />
          <h2>Looking for something?</h2>
          <p>
            Browse the marketplace, search by keyword, or narrow things down by
            category, price, condition and hostel block.
          </p>
          <p>
            Found your thing? Sign in with your college email and click Contact
            Seller to see their college email. Arrange a pickup, inspect the
            item and agree on payment directly.
          </p>
          <Link className="text-link" to="/marketplace">
            Find your next essential <ArrowRight size={16} />
          </Link>
        </article>
        <article className="form-panel">
          <ShoppingBag />
          <h2>Have something to sell?</h2>
          <p>
            Create an account, add an honest description and a clear photo, set
            a fair price, and choose a campus pickup location.
          </p>
          <p>
            Your college email is shared with signed-in buyers who contact you.
            Manage your listings, update details, and mark items sold once
            they’ve found a new home.
          </p>
          <Link className="text-link" to="/sell">
            List an item <ArrowRight size={16} />
          </Link>
        </article>
      </div>
      <article id="guidelines" className="form-panel guidelines">
        <ShieldCheck />
        <h2>A good community takes all of us.</h2>
        <ul>
          <li>List items you own and accurately describe their condition.</li>
          <li>
            No prohibited, illegal, stolen, counterfeit or unsafe goods. No
            academic cheating services.
          </li>
          <li>
            Be kind, keep communication respectful, and protect each other’s
            personal information.
          </li>
          <li>
            Meet in a public campus area. Inspect the item before paying. Never
            share passwords or payment OTPs.
          </li>
          <li>
            Use “Report this listing” for suspicious or inappropriate content.
            Moderators can hide listings.
          </li>
        </ul>
        <h3>Need a hand?</h3>
        <p>
          For account or moderation help, contact your campus HostelSwap project
          administrator in person. For a suspicious item, submit a report from
          its listing page.
        </p>
        <p className="field-help">
          HostelSwap facilitates student introductions. Payments and item
          exchanges happen directly between students. College email domains are
          restricted, but email ownership is not verified in this classroom MVP.
        </p>
      </article>
    </div>
  );
}
