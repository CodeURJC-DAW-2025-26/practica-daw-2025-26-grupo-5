import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Outlet, useNavigation } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";
import type { Route } from "./+types/home";

/**
 * Home Layout Component
 * Root layout that wraps all pages with navigation, spinner, and footer
 */
export default function Home() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      {isLoading && (
        <div className="page-spinner-overlay">
          <div className="dot-spinner" />
        </div>
      )}

      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const navigate = useNavigation();

  let errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <>
      <Header />
      <main className="mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{errorMessage}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => window.location.href = "/"}
          >
            Back to home
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}
