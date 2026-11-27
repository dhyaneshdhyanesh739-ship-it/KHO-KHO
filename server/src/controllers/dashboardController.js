import {
  initialTutorialVideos,
  initialMatchHighlights,
  initialPlayerPerformance,
  initialTeamPerformance,
  initialPracticeTasks,
} from '../data/khoKhoInitialData.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userIdentifier = req.user?.username || req.user?.id || req.query.userIdentifier || 'guest_user';

    // Summary numbers
    const totalTutorials = initialTutorialVideos.length;
    const totalHighlights = initialMatchHighlights.length;
    const totalDrills = initialPracticeTasks.length;
    const totalAthletes = initialPlayerPerformance.length;

    // Latest tutorials
    const recentTutorials = initialTutorialVideos.slice(0, 4);

    // Latest highlights
    const recentHighlights = initialMatchHighlights.slice(0, 3);

    // Top performers
    const topPerformers = [...initialPlayerPerformance].sort((a, b) => b.rating - a.rating).slice(0, 4);

    // Achievements & badges
    const achievements = [
      { title: "National Rank #1", desc: "Boys & Girls Squads Ranked #1 in State & South Zone", icon: "Trophy", color: "amber" },
      { title: "Dream Run Record", desc: "5m 12s Unbroken Defense Record by Girls Squad", icon: "Shield", color: "emerald" },
      { title: "Championship Gold", desc: "State Kho-Kho Champions 2026 Winner Trophy", icon: "Crown", color: "purple" },
      { title: "3-to-3 Mastery", desc: "100% Verified Adherence to Chain Kho-Kho Running Format", icon: "Activity", color: "saffron" }
    ];

    // Weekly activity trend (Mon - Sun)
    const weeklyActivityTrend = [
      { day: 'Mon', drills: 4, defenseMins: 38, attacks: 45 },
      { day: 'Tue', drills: 6, defenseMins: 52, attacks: 60 },
      { day: 'Wed', drills: 5, defenseMins: 44, attacks: 50 },
      { day: 'Thu', drills: 8, defenseMins: 65, attacks: 72 },
      { day: 'Fri', drills: 7, defenseMins: 58, attacks: 68 },
      { day: 'Sat', drills: 10, defenseMins: 80, attacks: 95 },
      { day: 'Sun', drills: 9, defenseMins: 75, attacks: 90 },
    ];

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalTutorials,
          totalHighlights,
          totalDrills,
          totalAthletes,
          boysWinRate: "87.5%",
          girlsWinRate: "89.3%",
        },
        recentTutorials,
        recentHighlights,
        topPerformers,
        teamStats: initialTeamPerformance,
        achievements,
        weeklyActivityTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};
