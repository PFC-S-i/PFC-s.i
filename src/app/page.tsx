"use client";

import {
  About,
  ContentSection,
  HeroSection,
  NewsletterSection,
} from "./components";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <About />
      <ContentSection />
      <NewsletterSection />
    </div>
  );
}
