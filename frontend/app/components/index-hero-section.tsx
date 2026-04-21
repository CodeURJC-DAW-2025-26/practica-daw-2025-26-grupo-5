/**
 * Hero Section Component
 *
 * Eye-catching hero banner for the homepage.
 * Introduces users to Stilnovo marketplace and guides them to actions.
 *
 * Sections:
 * 1. Category Navigation:
 *    - Horizontal category menu
 *    - Links filter products by category
 *    - Categories: Fashion, Technology, Cars, Home
 *    - Scrolls to featured products section when clicked
 *
 * 2. Main Hero Banner:
 *    - Large headline: "Reinvent your space..."
 *    - Subtitle: "Start buying or selling..."
 *    - Call-to-action buttons:
 *      - "Sell Now" → Create new product (/product/new)
 *      - "About Us" → Company info page
 *    - Banner image on right side
 *    - Decorative glow background effect
 *    - Responsive layout (stacked on mobile)
 *
 * 3. Scroll Indicator:
 *    - Chevron icon appearing on desktop
 *    - Guides users to featured products section
 *    - Links to #featured-treasures anchor
 *
 * 4. Content Divider:
 *    - Section separator below hero
 *    - Motivational phrase: "Curated treasures..."
 *    - Smooth transition to product listings
 *
 * Responsive Design:
 * - Desktop: Side-by-side text and image
 * - Tablet: Stacked layout
 * - Mobile: Full-width text, image below
 * - Scroll indicator hidden on mobile/tablet
 *
 * Assets:
 * - bannerImg: Main promotional image
 * - Clay-style card with floating effect
 * - Glow background element
 *
 * Navigation Flow:
 * - Categories allow instant filtering
 * - CTA buttons lead to key user journeys
 * - Scroll indicator encourages product discovery
 *
 * @component
 * @returns React component with homepage hero section
 */

import { Link } from "react-router";
import { useUserStore } from "~/stores/useUserStore";
import bannerImg from "~/assets/main-banner.png"; // Use your main banner image here

/**
 * Hero Section Component Implementation
 * 
 * Renders hero banner with category navigation, call-to-action, and scroll guide.
 */
export default function HeroSection() {
    const { user } = useUserStore();

    return (
        <>
            {/* --- HERO AND CATEGORY NAVIGATION WRAPPER --- */}
            <div className="hero-wrapper position-relative">
                {/* --- CATEGORY NAVIGATION --- */}
                <nav className="sub-nav">
                    <div className="container d-flex justify-content-center align-items-center gap-4 py-3">
                        <span className="label-categories">Categories</span>
                        <div className="category-list d-flex gap-4">
                            <Link to="/?category=Fashion#featured-treasures">Fashion</Link>
                            <Link to="/?category=Tech#featured-treasures">Technology</Link>
                            <Link to="/?category=Cars#featured-treasures">Cars</Link>
                            <Link to="/?category=Home#featured-treasures">Home</Link>
                        </div>
                    </div>
                </nav>

                {/* --- MAIN HERO BANNER --- */}
                <main className="hero container d-flex align-items-center justify-content-center flex-grow-1">
                    <div className="row align-items-center w-100 g-0">
                        <div className="col-lg-6 hero-text-block">
                            <h1 className="fw-800">
                                Reinvent your space: Where design with history finds its new home.
                            </h1>
                            <p className="hero-subtitle mt-3">
                                Start buying or selling your items today
                            </p>
                            <div className="hero-btns mt-5 d-flex gap-3">
                                <Link
                                    to="/product/new"
                                    className="btn-sell text-decoration-none"
                                >
                                    Sell Now
                                </Link>
                                <Link to="/about" className="btn-about text-decoration-none">
                                    About Us
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-6 text-center position-relative h-100">
                            <div className="hero-glow"></div>
                            <img
                                src={bannerImg}
                                alt="Stilnovo Banner"
                                className="clay-float img-fluid position-relative z-1"
                                style={{ maxHeight: '100%', objectFit: 'contain' }}
                            />
                        </div>
                    </div>
                </main>

                {/* --- SCROLL INDICATOR --- */}
                <div className="scroll-indicator d-none d-md-block">
                    <a href="#featured-treasures" className="scroll-arrow">
                        <i className="fa-solid fa-chevron-down"></i>
                    </a>
                </div>
            </div> {/* --- END OF HERO WRAPPER --- */}

            {/* --- CONTENT DIVIDER (NOW CORRECTLY OUTSIDE) --- */}
            <div id="featured-treasures" className="content-divider">
                <div className="container text-center py-4">
                    <p className="divider-phrase">
                        Curated treasures waiting for a new chapter
                    </p>
                </div>
            </div>
        </>
    );
}