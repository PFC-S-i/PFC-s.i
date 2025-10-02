"use client";

import {
  About,
  HeroSection,
  NewsletterSection,
  TeamSection,
  FeatureCardsSection,
} from "./components";
import NewsCarousel from "./components/news-carousel";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeatureCardsSection />
      <NewsCarousel />
      <About />
      <TeamSection />
      <NewsletterSection />
    </div>
  );
}
