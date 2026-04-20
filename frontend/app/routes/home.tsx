import { Outlet, useNavigation, useLocation } from "react-router";
import Header from "~/components/header";
import Footer from "~/components/footer";
import HeroSection from "~/components/index-hero-section";
import Loader from "~/components/Loader";

export default function Home() {
  const navigation = useNavigation();
  const location = useLocation();
  
  const isLoading = navigation.state === "loading";
  const nextPath = navigation.location?.pathname || "";
  const isGoingToProduct = nextPath.startsWith("/product");

  return (
    <>
      <Header />
      <main>
        {location.pathname === "/" && <HeroSection />}
        <Outlet /> 
      </main>
      <Footer />
    </>
  );
}