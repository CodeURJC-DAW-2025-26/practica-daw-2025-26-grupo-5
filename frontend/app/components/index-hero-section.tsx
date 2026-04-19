import { Link } from "react-router";
import { useUserStore } from "~/stores/useUserStore";
import bannerImg from "~/assets/main-banner.png"; // Use your main banner image here

/**
 * HeroSection Component
 * Corrected structure to match Stilnovo's P2 design and prevent content overlap
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