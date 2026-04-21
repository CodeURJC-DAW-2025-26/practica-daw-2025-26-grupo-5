/**
 * Application Initialization Loading Screen Component
 *
 * Displays a branded loading screen with spinner and text during app startup.
 * Shown when initializing Stilnovo application or loading critical resources.
 *
 * Features:
 * - Full-page overlay with dark background
 * - Custom animated spinner
 * - Branding text: "Loading Stilnovo..."
 * - Centered layout
 * - Semantic message for accessibility
 * - Prevents user interaction during loading
 *
 * Usage:
 * - Application initialization/startup
 * - Loading global state or critical data
 * - Fallback while main app component mounts
 * - Shown before routing engine initializes
 *
 * Layout:
 * - Vertical stack layout
 * - Spinner animation on top
 * - Text label below spinner
 * - Centered in viewport
 *
 * Styling:
 * - Class: page-spinner-overlay (full screen container)
 * - Class: custom-loader (animated spinner)
 * - Text: Bold, secondary color, 0.9rem font size
 * - Spacing: mb-3 margin below spinner
 *
 * Duration:
 * - Typically brief (1-3 seconds)
 * - Faster than HTTP requests used
 * - Should not block interactive elements
 *
 * @component
 * @returns Application loading screen with branded message
 */

import React from 'react';

/**
 * App Loader Component Implementation
 * 
 * Renders Stilnovo branded loading screen.
 */
const Loader = () => {
    return (
        <div className="page-spinner-overlay">
                <div className="custom-loader mb-3" />
                <p className="fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>
                    Loading Stilnovo...
                </p>
        </div>
    );
}

export default Loader;