import React, { useState } from 'react';
import Navbar from '../../components/navigation/Navbar';
import HeroSection from '../../components/layout/HeroSection';
import AboutKhoKhoSection from '../../components/layout/AboutKhoKhoSection';
import AboutUsSection from '../../components/layout/AboutUsSection';
import AchievementsSection from '../../components/layout/AchievementsSection';
import TeamRosterSummarySection from '../../components/layout/TeamRosterSummarySection';
import GallerySection from '../../components/layout/GallerySection';
import ContactSection from '../../components/layout/ContactSection';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/forms/LoginModal';

export default function HomePage({ onLoginSuccess }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-court-sand text-navy-900 selection:bg-saffron-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setLoginModalOpen(true)}
        onNavigateSection={handleScrollToSection}
      />

      {/* Main Sections */}
      <main>
        <HeroSection
          onOpenLogin={() => setLoginModalOpen(true)}
          onExploreTeams={() => handleScrollToSection('teams')}
        />

        <AboutKhoKhoSection />

        <AboutUsSection />

        <AchievementsSection />

        <TeamRosterSummarySection
          onOpenLogin={() => setLoginModalOpen(true)}
        />

        <GallerySection />

        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={handleScrollToSection}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Login Flow Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
}
