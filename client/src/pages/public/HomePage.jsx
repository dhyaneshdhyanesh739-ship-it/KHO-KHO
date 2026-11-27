import React, { useState } from 'react';
import Navbar from '../../components/navigation/Navbar';
import HeroSection from '../../components/layout/HeroSection';
import InteractivePublicDashboard from '../../components/dashboard/InteractivePublicDashboard';
import LearnKhoKhoSection from '../../components/learn/LearnKhoKhoSection';
import PlayerPerformanceSection from '../../components/performance/PlayerPerformanceSection';
import MatchHighlightsSection from '../../components/highlights/MatchHighlightsSection';
import DailyPracticeSection from '../../components/practice/DailyPracticeSection';
import AboutKhoKhoSection from '../../components/layout/AboutKhoKhoSection';
import AboutUsSection from '../../components/layout/AboutUsSection';
import AchievementsSection from '../../components/layout/AchievementsSection';
import TeamRosterSummarySection from '../../components/layout/TeamRosterSummarySection';
import GallerySection from '../../components/layout/GallerySection';
import ContactSection from '../../components/layout/ContactSection';
import CreatedBySection from '../../components/layout/CreatedBySection';
import Footer from '../../components/layout/Footer';
import LoginModal from '../../components/forms/LoginModal';

export default function HomePage({ onLoginSuccess, onViewDashboard }) {
  const [loginModalState, setLoginModalState] = useState({ isOpen: false, mode: 'TEAM' });

  const handleOpenTeamLogin = () => setLoginModalState({ isOpen: true, mode: 'TEAM' });

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-court-sand dark:bg-[#0b1120] text-navy-900 dark:text-slate-100 selection:bg-saffron-500 selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={handleOpenTeamLogin}
        onOpenTeamLogin={handleOpenTeamLogin}
        onNavigateSection={handleScrollToSection}
        onGoToDashboard={onViewDashboard}
      />

      {/* Main Sections */}
      <main>
        <HeroSection
          onOpenLogin={handleOpenTeamLogin}
          onExploreTeams={() => handleScrollToSection('teams')}
        />

        {/* 1. Interactive Unified Live Dashboard */}
        <InteractivePublicDashboard
          onNavigateSection={handleScrollToSection}
          onOpenLogin={handleOpenTeamLogin}
        />

        {/* 2. Kho-Kho Learning & Video Tutorials Academy */}
        <LearnKhoKhoSection />

        {/* 3. Player & Team Performance Analytics */}
        <PlayerPerformanceSection />

        {/* 4. Match Highlights & Video Analysis */}
        <MatchHighlightsSection />

        {/* 5. Daily Kho-Kho Practice & Training Routines */}
        <DailyPracticeSection />

        {/* 6. Heritage & Court Dimensions */}
        <AboutKhoKhoSection />

        {/* 7. About Organization & Coaches */}
        <AboutUsSection />

        {/* 8. Championship Achievements */}
        <AchievementsSection />

        {/* 9. Squad Roster Summary */}
        <TeamRosterSummarySection
          onOpenLogin={handleOpenTeamLogin}
        />

        {/* 10. Photo Gallery */}
        <GallerySection />

        {/* 11. Contact Inquiries */}
        <ContactSection />

        {/* 12. Created By Credits */}
        <CreatedBySection />
      </main>

      {/* Footer */}
      <Footer
        onNavigateSection={handleScrollToSection}
        onOpenLogin={handleOpenTeamLogin}
      />

      {/* Login Flow Modal */}
      <LoginModal
        isOpen={loginModalState.isOpen}
        initialMode={loginModalState.mode}
        onClose={() => setLoginModalState(prev => ({ ...prev, isOpen: false }))}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
}
