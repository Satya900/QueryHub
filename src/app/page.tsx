import HeroSection from "./components/HeroSection";
import LatestQuestions from "./components/LatestQuestions";
import TopContributors from "./components/TopContributors";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5"></div>

        <HeroSection />
        <div className="relative z-10">
          <LatestQuestions />
          <TopContributors />
        </div>
        <Footer />
      </div>
    </main>
  );
}