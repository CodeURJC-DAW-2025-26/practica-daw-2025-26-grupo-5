/**
 * Page Loading Spinner Overlay Component
 *
 * Displays a full-page loading overlay with spinning animation.
 * Used as a fallback during page transitions and data loading.
 *
 * Features:
 * - Full-page overlay (covers entire viewport)
 * - Custom spinner animation (CSS-based)
 * - Centered positioning
 * - Semi-transparent background
 * - Prevents interaction while loading
 *
 * Usage:
 * - Fallback UI for route loaders
 * - Displayed while page is loading
 * - Should be brief (typically <1 second)
 *
 * Styling:
 * - Class: page-spinner-overlay (full screen overlay)
 * - Class: custom-loader (animated spinner)
 * - CSS defined in global styles
 *
 * @component
 * @returns Loading spinner overlay element
 */

import React from 'react';

/**
 * Loader Component Implementation
 * 
 * Renders minimal loading indicator.
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