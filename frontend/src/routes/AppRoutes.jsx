import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import { MarketplacePage } from "../pages/MarketplacePage.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { ListingDetailsPage } from "../pages/ListingDetailsPage.jsx";
import { ListingFormPage } from "../pages/ListingFormPage.jsx";
import { MyListingsPage } from "../pages/MyListingsPage.jsx";
import { ProfilePage } from "../pages/ProfilePage.jsx";
import { AdminPage } from "../pages/AdminPage.jsx";
import { HelpPage } from "../pages/HelpPage.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage register />} />
      <Route path="/listings/:id" element={<ListingDetailsPage />} />
      <Route
        path="/sell"
        element={
          <ProtectedRoute>
            <ListingFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/:id/edit"
        element={
          <ProtectedRoute>
            <ListingFormPage edit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-listings"
        element={
          <ProtectedRoute>
            <MyListingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute admin>
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/help" element={<HelpPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
