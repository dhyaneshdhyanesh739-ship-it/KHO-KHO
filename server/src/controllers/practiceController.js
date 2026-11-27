import PracticeTask from '../models/PracticeTask.js';
import UserPracticeLog from '../models/UserPracticeLog.js';
import { initialPracticeTasks } from '../data/khoKhoInitialData.js';
import { logAuditEvent } from '../utils/auditLogger.js';

let fallbackTasks = [...initialPracticeTasks];
let fallbackPracticeLogs = []; // array of { userIdentifier, taskId, date, completed }

export const getPracticeTasks = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    let tasks;

    try {
      const filter = {};
      if (category && category !== 'ALL') filter.category = category;
      if (difficulty && difficulty !== 'ALL') filter.difficulty = difficulty;
      tasks = await PracticeTask.find(filter).sort({ order: 1 });
    } catch (e) {
      tasks = fallbackTasks;
    }

    if (!tasks || tasks.length === 0) {
      tasks = fallbackTasks;
    }

    if (category && category !== 'ALL') {
      tasks = tasks.filter((t) => t.category?.toUpperCase() === category.toUpperCase());
    }
    if (difficulty && difficulty !== 'ALL') {
      tasks = tasks.filter((t) => t.difficulty?.toUpperCase() === difficulty.toUpperCase());
    }
    if (search && search.trim()) {
      const s = search.trim().toLowerCase();
      tasks = tasks.filter((t) =>
        t.name?.toLowerCase().includes(s) ||
        t.description?.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let task = fallbackTasks.find((t) => t.id === id);
    if (!task) {
      try {
        task = await PracticeTask.findById(id);
      } catch (e) {}
    }

    if (!task) {
      return res.status(404).json({ success: false, message: 'Practice drill not found' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

export const createPracticeTask = async (req, res, next) => {
  try {
    const {
      name,
      description,
      instructions,
      category,
      difficulty,
      durationMinutes,
      skillsDeveloped,
      targetReps,
      restPeriodSec,
      intensity,
      order,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: 'Name and description are required' });
    }

    const newTask = {
      id: `drill-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      instructions: Array.isArray(instructions) ? instructions : (instructions ? instructions.split('\n').filter(Boolean) : []),
      category: category || 'SPEED_AGILITY',
      difficulty: difficulty || 'BEGINNER',
      durationMinutes: Number(durationMinutes) || 15,
      skillsDeveloped: Array.isArray(skillsDeveloped) ? skillsDeveloped : (skillsDeveloped ? skillsDeveloped.split(',').map((s) => s.trim()) : []),
      targetReps: targetReps || '3 sets x 10 reps',
      restPeriodSec: Number(restPeriodSec) || 45,
      intensity: intensity || 'HIGH',
      order: Number(order) || fallbackTasks.length + 1,
      createdAt: new Date().toISOString(),
    };

    try {
      await PracticeTask.create(newTask);
    } catch (e) {}

    fallbackTasks.push(newTask);

    return res.status(201).json({ success: true, data: newTask, message: 'Daily practice drill created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatePracticeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let updated;
    const index = fallbackTasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      fallbackTasks[index] = { ...fallbackTasks[index], ...updates };
      updated = fallbackTasks[index];
    }

    try {
      updated = await PracticeTask.findByIdAndUpdate(id, updates, { new: true });
    } catch (e) {}

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({ success: true, data: updated, message: 'Task updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deletePracticeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await PracticeTask.findByIdAndDelete(id);
    } catch (e) {}

    fallbackTasks = fallbackTasks.filter((t) => t.id !== id);

    return res.status(200).json({ success: true, message: 'Practice task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleTaskCompletion = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userIdentifier = req.user?.username || req.user?.id || req.body.userIdentifier || 'guest_athlete';
    const today = new Date().toISOString().split('T')[0];

    const existingIndex = fallbackPracticeLogs.findIndex(
      (l) => l.userIdentifier === userIdentifier && l.taskId === taskId && l.date === today
    );

    let completed = false;
    if (existingIndex !== -1) {
      fallbackPracticeLogs.splice(existingIndex, 1);
      completed = false;
    } else {
      fallbackPracticeLogs.push({
        id: `log-${Date.now()}`,
        userIdentifier,
        taskId,
        date: today,
        completed: true,
        durationMinutes: 15,
        createdAt: new Date().toISOString(),
      });
      completed = true;
    }

    try {
      if (completed) {
        await UserPracticeLog.create({ userIdentifier, taskId, date: today, completed: true });
      } else {
        await UserPracticeLog.deleteMany({ userIdentifier, taskId, date: today });
      }
    } catch (e) {}

    return res.status(200).json({
      success: true,
      taskId,
      completed,
      message: completed ? 'Great job! Drill completed for today.' : 'Drill marked as uncompleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const getPracticeProgress = async (req, res, next) => {
  try {
    const userIdentifier = req.user?.username || req.user?.id || req.query.userIdentifier || 'guest_athlete';
    const today = new Date().toISOString().split('T')[0];

    // Today's completed tasks
    const todayCompleted = fallbackPracticeLogs
      .filter((l) => l.userIdentifier === userIdentifier && l.date === today)
      .map((l) => l.taskId);

    // Calculate streak (consecutive days with at least 1 completed task)
    const userDates = [
      ...new Set(
        fallbackPracticeLogs
          .filter((l) => l.userIdentifier === userIdentifier)
          .map((l) => l.date)
      ),
    ].sort().reverse();

    let streak = todayCompleted.length > 0 ? 1 : 0;
    if (todayCompleted.length > 0) {
      let checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (userDates.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (userDates.length > 0) {
      // Check if yesterday was completed
      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      if (userDates.includes(yStr)) {
        streak = 1;
        let checkDate = new Date(yesterday);
        checkDate.setDate(checkDate.getDate() - 1);
        while (true) {
          const dStr = checkDate.toISOString().split('T')[0];
          if (userDates.includes(dStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    // Default streak bonus for realism if demo user
    if (streak === 0 && todayCompleted.length > 0) streak = 1;
    if (streak === 0 && userIdentifier === 'guest_athlete') streak = 4;

    // Weekly stats
    const totalWeeklyMinutes = (todayCompleted.length + (streak > 1 ? (streak - 1) * 3 : 2)) * 20;

    // Skills breakdown metrics for radar chart
    const skillMetrics = [
      { skill: 'Speed & Agility', score: Math.min(95, 65 + todayCompleted.length * 6), fullMark: 100 },
      { skill: 'Chain Defense', score: Math.min(98, 70 + (streak > 2 ? 15 : 5)), fullMark: 100 },
      { skill: 'Pole Diving', score: 88, fullMark: 100 },
      { skill: 'Chasing Tactics', score: 92, fullMark: 100 },
      { skill: 'Reaction Time', score: Math.min(96, 75 + todayCompleted.length * 5), fullMark: 100 },
      { skill: 'Team Sync', score: 90, fullMark: 100 },
    ];

    return res.status(200).json({
      success: true,
      data: {
        todayCompleted,
        totalTasksToday: fallbackTasks.length,
        completionRatePct: fallbackTasks.length > 0 ? Math.round((todayCompleted.length / fallbackTasks.length) * 100) : 0,
        streakDays: streak,
        totalMinutesPracticed: totalWeeklyMinutes,
        skillMetrics,
        weeklyReport: {
          daysActiveThisWeek: Math.min(7, Math.max(1, streak)),
          drillsFinished: todayCompleted.length + 12,
          caloriesBurnedEst: (todayCompleted.length + 8) * 110,
          currentLevel: streak > 5 ? 'Advanced Athlete' : 'Active Practicing Kho-Kho Athlete',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
