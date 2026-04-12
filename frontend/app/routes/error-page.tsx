// app/routes/error-page.tsx
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";
import logo from "../assets/logo.png";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  let status = 500;
  let title = "Server Error";
  let message = "Something went wrong on our end. Our tech treasures are being polished.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (error.status === 404) {
      title = "Not Found";
      message = "We couldn't find the treasure you were looking for, but the marketplace is still full of history.";
    }
  }

  return (
    <div className="error-wrapper-full">
      <div className="error-card-wide animate-fade-in">
        
        {/* LOGO */}
        <div className="d-flex justify-content-center mb-5">
            <div className="logo-container-error shadow-clay">
                <img src={logo} alt="Stilnovo" width="60" />
            </div>
        </div>

        {/* CONTENT */}
        <div className="text-center">
            <h1 className="error-code-giant mb-1">{status}</h1>
            <h2 className="fw-800 text-dark mb-4 display-5">{title}</h2>
            
            <p className="text-muted fw-500 fs-5 mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                {message}
            </p>

            {/* BUTTONS - Ahora con colores fijos para evitar que sean invisibles */}
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
              <button 
                onClick={() => navigate("/")}
                className="btn-primary-stilnovo"
              >
                <i className="fa-solid fa-house"></i> Back to Homepage
              </button>
              
              <button 
                onClick={() => navigate(-1)} 
                className="btn-outline-stilnovo"
              >
                <i className="fa-solid fa-arrow-left me-2"></i> Go Back
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}