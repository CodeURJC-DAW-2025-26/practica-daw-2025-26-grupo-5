import { Container, Row, Col, Button, Badge, Image } from 'react-bootstrap';
import { Link } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";
import mainBanner from "~/assets/main-banner.png";

export default function AboutUs() {
    return (
        <>
            <Header />

            <main className="about-page">
                {/* Hero Section */}
                <section className="hero-wrapper overflow-hidden bg-white">
                    <Container className="py-5 mt-lg-5">
                        <Row className="align-items-center g-5">
                            <Col lg={6}>
                                <Badge
                                    pill
                                    className="px-3 py-2 mb-3"
                                    style={{ background: 'rgb(255, 255, 255)', color: '#ffffff', fontWeight: 700 }}
                                >
                                    EST. 2026
                                </Badge>
                                <h1 className="display-4 fw-800 lh-1 text-dark">Giving design a second life.</h1>
                                <p className="lead mt-4 text-muted opacity-75">
                                    Stilnovo is more than a marketplace; it's a bridge between eras. We curate a space
                                    where history meets modern durability, ensuring every treasure finds its rightful home.
                                </p>
                                <div className="d-flex gap-3 mt-5">
                                    <Link to="/" className="btn btn-primary rounded-pill px-4 py-2 fw-bold">
                                        Explore Market
                                    </Link>
                                    <Link to="/signup" className="btn btn-outline-dark rounded-pill px-4 py-2 fw-bold">
                                        Join Community
                                    </Link>
                                </div>
                            </Col>
                            <Col lg={6} className="text-center position-relative">
                                <Image
                                    src={mainBanner}
                                    alt="Stilnovo Hero"
                                    fluid
                                    className="z-1"
                                    style={{ maxHeight: '450px' }}
                                />
                            </Col>
                        </Row>
                    </Container>
                </section>

                {/* Stats Section */}
                <Container className="py-5">
                    <div className="p-5 bg-light rounded-4 border-0 shadow-sm">
                        <Row className="text-center g-4">
                            <Col md={4}>
                                <h2 className="fw-800 text-primary mb-1">5K+</h2>
                                <p className="small text-muted text-uppercase fw-700">Active Users</p>
                            </Col>
                            <Col md={4} className="border-start border-end border-opacity-10">
                                <h2 className="fw-800 text-primary mb-1">12K+</h2>
                                <p className="small text-muted text-uppercase fw-700">Treasures Sold</p>
                            </Col>
                            <Col md={4}>
                                <h2 className="fw-800 text-primary mb-1">100%</h2>
                                <p className="small text-muted text-uppercase fw-700">Curated Quality</p>
                            </Col>
                        </Row>
                    </div>
                </Container>

                {/* Core Principles */}
                <section className="container py-5 mb-5">
                    <div className="text-center mb-5">
                        <h2 className="fw-800 text-dark">Our Core Principles</h2>
                        <p className="text-muted">The pillars that define the Stilnovo experience.</p>
                    </div>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="p-4 text-center h-100 border rounded-4 shadow-sm bg-white">
                                <i className="fa-solid fa-leaf fa-2x text-success mb-3"></i>
                                <h4 className="fw-800">Sustainability</h4>
                                <p className="small text-muted px-3">Promoting a circular economy by extending the lifecycle of premium design objects.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-4 text-center h-100 border rounded-4 shadow-sm bg-white">
                                <i className="fa-solid fa-gem fa-2x text-warning mb-3"></i>
                                <h4 className="fw-800">Curation</h4>
                                <p className="small text-muted px-3">Each listing is reviewed to ensure it meets our standards of authenticity.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="p-4 text-center h-100 border rounded-4 shadow-sm bg-white">
                                <i className="fa-solid fa-shield-halved fa-2x text-primary mb-3"></i>
                                <h4 className="fw-800">Security</h4>
                                <p className="small text-muted px-3">Advanced protection for both sellers and buyers in every transaction.</p>
                            </div>
                        </Col>
                    </Row>
                </section>
            </main>

            <Footer />
        </>
    );
}