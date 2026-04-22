/**
 * Unified Page Loading Spinner Component
 * * High-order overlay component that handles both global app initialization 
 * and standard route transition states.
 * * Features:
 * - Full-page viewport coverage with semi-transparent backdrop.
 * - Prevents background interaction (pointer-events) during active states.
 * - Adaptive rendering: Can display as a minimal spinner or a branded loading screen.
 * - Optimized CSS-only animation for maximum performance.
 * * Props:
 * @param {boolean} [isInitPage=false] - When true, displays the "Loading Stilnovo..." 
 * text fragment. Ideal for cold starts and initial authentication checks.
 * * CSS Dependencies:
 * - .page-spinner-overlay: Handles the fixed positioning and backdrop.
 * - .custom-loader: The core CSS animation for the spinner.
 * * Usage:
 * - Standard: <Loader /> (Minimal spinner)
 * - App Init: <Loader isInitPage={true} /> (With branding text)
 * * @component
 */
interface LoaderProps {
    isInitPage?: boolean;
}

const Loader = ({ isInitPage = false }: LoaderProps) => {
    return (
        <div className="page-spinner-overlay">
            <div className="custom-loader mb-3" />

            {isInitPage && (
                <p className="fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>
                    Loading Stilnovo...
                </p>
            )}
        </div>
    );
};

export default Loader;