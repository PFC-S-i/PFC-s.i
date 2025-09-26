"use client";

import { ContentSection, HeroSection, NewsletterSection } from "./components";
import NewsCarousel from "./components/news-carousel";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <NewsCarousel />
      <ContentSection />
      <NewsletterSection />
    </div>
  );
}
