import { BrowserRouter } from "react-router-dom";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { ScrollToTop } from "./routes/ScrollToTop.jsx";
import { SessionProvider } from "./context/SessionProvider.jsx";
import { AppRoutes } from "./routes/AppRoutes.jsx";
import { Toast } from "./components/ui/Toast.jsx";

export function App() {
  return (
    <SessionProvider>
      <BrowserRouter>
        <a className="skip-link" href="#app-main">Skip to content</a>
        <ScrollToTop />
        <Header />
        <main id="app-main" tabIndex={-1}>
          <AppRoutes />
        </main>
        <Footer />
        <Toast />
      </BrowserRouter>
    </SessionProvider>
  );
}
