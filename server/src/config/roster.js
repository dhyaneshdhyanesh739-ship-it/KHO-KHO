/**
 * Single Source of Truth for Official Kho-Kho Roster & Credentials
 *
 * 21 Boys Team Athletes
 * 13 Girls Team Athletes
 * Dedicated Administrative Accounts
 */

export const OFFICIAL_BOYS_ROSTER = [
  { id: 'B-01', username: 'mohan', name: 'MOHAN', jersey: 1, pos: 'Pole Diver', blood: 'O+', team: 'BOYS' },
  { id: 'B-02', username: 'jelphin', name: 'JELPHIN', jersey: 2, pos: 'Running Chaser', blood: 'B+', team: 'BOYS' },
  { id: 'B-03', username: 'vicky.v', name: 'VICKY.V', jersey: 3, pos: 'Defender', blood: 'A+', team: 'BOYS' },
  { id: 'B-04', username: 'kishor', name: 'KISHOR', jersey: 4, pos: 'All-Rounder', blood: 'AB+', team: 'BOYS' },
  { id: 'B-05', username: 'harshad', name: 'HARSHAD', jersey: 5, pos: 'Chaser', blood: 'O+', team: 'BOYS' },
  { id: 'B-06', username: 'elan', name: 'ELAN', jersey: 6, pos: 'Defender', blood: 'B+', team: 'BOYS' },
  { id: 'B-07', username: 'vimal.s', name: 'VIMAL.S', jersey: 7, pos: 'Pole Diver', blood: 'A-', team: 'BOYS' },
  { id: 'B-08', username: 'karan', name: 'KARAN', jersey: 8, pos: 'Running Chaser', blood: 'O-', team: 'BOYS' },
  { id: 'B-09', username: 'harish', name: 'HARISH', jersey: 9, pos: 'Defender', blood: 'A+', team: 'BOYS' },
  { id: 'B-10', username: 's.e.d', name: 'S.E.D', jersey: 10, pos: 'All-Rounder', blood: 'B+', team: 'BOYS' },
  { id: 'B-11', username: 'akash', name: 'AKASH', jersey: 11, pos: 'Chaser', blood: 'O+', team: 'BOYS' },
  { id: 'B-12', username: 'sriram', name: 'SRIRAM', jersey: 12, pos: 'All-Rounder', blood: 'O+', team: 'BOYS' },
  { id: 'B-13', username: 'mega', name: 'MEGA', jersey: 13, pos: 'Running Chaser', blood: 'B+', team: 'BOYS' },
  { id: 'B-14', username: 'abhinav', name: 'ABHINAV', jersey: 14, pos: 'Defender', blood: 'O+', team: 'BOYS' },
  { id: 'B-15', username: 'sanjay', name: 'SANJAY', jersey: 15, pos: 'All-Rounder', blood: 'A+', team: 'BOYS' },
  { id: 'B-16', username: 'chithranjan', name: 'CHITHRANJAN', jersey: 16, pos: 'Chaser', blood: 'B-', team: 'BOYS' },
  { id: 'B-17', username: 'dharshan', name: 'DHARSHAN', jersey: 17, pos: 'Pole Diver', blood: 'A+', team: 'BOYS' },
  { id: 'B-18', username: 'sivaguru', name: 'SIVAGURU', jersey: 18, pos: 'Running Chaser', blood: 'AB+', team: 'BOYS' },
  { id: 'B-19', username: 'subu', name: 'SUBU', jersey: 19, pos: 'All-Rounder', blood: 'B+', team: 'BOYS' },
  { id: 'B-20', username: 'thangadurai', name: 'THANGADURAI', jersey: 20, pos: 'Defender', blood: 'A-', team: 'BOYS' },
  { id: 'B-21', username: 'jeeva', name: 'JEEVA', jersey: 21, pos: 'Chaser', blood: 'B+', team: 'BOYS' },
];

export const OFFICIAL_GIRLS_ROSTER = [
  { id: 'G-01', username: 'keerthana', name: 'KEERTHANA', jersey: 1, pos: 'Pole Diver', blood: 'O+', team: 'GIRLS' },
  { id: 'G-02', username: 'sabiksha', name: 'SABIKSHA', jersey: 2, pos: 'Running Chaser', blood: 'A+', team: 'GIRLS' },
  { id: 'G-03', username: 'atshaya', name: 'ATSHAYA', jersey: 3, pos: 'Defender', blood: 'B+', team: 'GIRLS' },
  { id: 'G-04', username: 'nisha', name: 'NISHA', jersey: 4, pos: 'All-Rounder', blood: 'AB+', team: 'GIRLS' },
  { id: 'G-05', username: 'juna', name: 'JUNA', jersey: 5, pos: 'Chaser', blood: 'O+', team: 'GIRLS' },
  { id: 'G-06', username: 'sharmitha', name: 'SHARMITHA', jersey: 6, pos: 'Defender', blood: 'A-', team: 'GIRLS' },
  { id: 'G-07', username: 'lohii', name: 'LOHII', jersey: 7, pos: 'Pole Diver', blood: 'B+', team: 'GIRLS' },
  { id: 'G-08', username: 'subitha', name: 'SUBITHA', jersey: 8, pos: 'Running Chaser', blood: 'O-', team: 'GIRLS' },
  { id: 'G-09', username: 'shana', name: 'SHANA', jersey: 9, pos: 'Defender', blood: 'B+', team: 'GIRLS' },
  { id: 'G-10', username: 'madhu', name: 'MADHU', jersey: 10, pos: 'All-Rounder', blood: 'A+', team: 'GIRLS' },
  { id: 'G-11', username: 'pooja', name: 'POOJA', jersey: 11, pos: 'Chaser', blood: 'O+', team: 'GIRLS' },
  { id: 'G-12', username: 'vidhya', name: 'VIDHYA', jersey: 12, pos: 'Defender', blood: 'AB-', team: 'GIRLS' },
  { id: 'G-13', username: 'reeta', name: 'REETA', jersey: 13, pos: 'Pole Diver', blood: 'B+', team: 'GIRLS' },
];

export const ALL_OFFICIAL_PLAYERS = [...OFFICIAL_BOYS_ROSTER, ...OFFICIAL_GIRLS_ROSTER];

export const OFFICIAL_ADMINS = [
  {
    id: 'super-admin-dhyanesh',
    username: 'dhyanesh',
    name: 'Dhyanesh.S.E (Super Administrator)',
    email: 'dhyaneshdhyanesh739@gmail.com',
    role: 'SUPER_ADMIN',
    team: 'ALL',
    passwords: ['kiddo@khokho', 'Dhyanesh@23012007'],
  },
  {
    id: 'super-admin-default',
    username: 'superadmin',
    name: 'Super Administrator',
    email: 'dhyaneshdhyanesh739@gmail.com',
    role: 'SUPER_ADMIN',
    team: 'ALL',
    passwords: ['SuperAdmin@KhoKho2026!', 'kiddo@khokho'],
  },
  {
    id: 'boys-admin-default',
    username: 'boysadmin',
    name: 'Coach Dhyanesh.S.E & MuthuvelRaja.S',
    email: 'boysadmin@khokhoarena.org',
    role: 'BOYS_ADMIN',
    team: 'BOYS',
    passwords: ['kiddo@khokho', 'BoysAdmin@KhoKho2026!'],
  },
  {
    id: 'boys-admin-vimal',
    username: 'vimal',
    name: 'Coach Vimal',
    email: 'vimal@khokhoarena.org',
    role: 'BOYS_ADMIN',
    team: 'BOYS',
    passwords: ['Vimal@1234', 'kiddo@khokho', 'BoysAdmin@KhoKho2026!'],
  },
  {
    id: 'girls-admin-default',
    username: 'girlsadmin',
    name: 'Coach Keerthana',
    email: 'coach.keerthana@khokhoarena.org',
    role: 'GIRLS_ADMIN',
    team: 'GIRLS',
    passwords: ['kiddo@khokho', 'GirlsAdmin@KhoKho2026!'],
  },
  {
    id: 'girls-admin-keerthana',
    username: 'keerthana',
    name: 'Coach Keerthana',
    email: 'coach.keerthana@khokhoarena.org',
    role: 'GIRLS_ADMIN',
    team: 'GIRLS',
    passwords: ['keerthama@1234', 'keerthana@1234', 'kiddo@khokho', 'GirlsAdmin@KhoKho2026!'],
  },
];

/**
 * Validates if a username belongs to the approved list
 */
export const isApprovedUsername = (rawUsername) => {
  if (!rawUsername) return false;
  const u = rawUsername.trim().toLowerCase();
  const cleanU = u.replace(/\./g, '');

  const inAdmins = OFFICIAL_ADMINS.some(
    (a) => a.username.toLowerCase() === u || a.username.replace(/\./g, '').toLowerCase() === cleanU
  );
  if (inAdmins) return true;

  const inPlayers = ALL_OFFICIAL_PLAYERS.some(
    (p) => p.username.toLowerCase() === u || p.username.replace(/\./g, '').toLowerCase() === cleanU
  );
  return inPlayers;
};

/**
 * Finds player by username or ID
 */
export const findOfficialPlayer = (identifier) => {
  if (!identifier) return null;
  const idStr = String(identifier).trim().toLowerCase();
  const cleanIdStr = idStr.replace(/\./g, '');

  return (
    ALL_OFFICIAL_PLAYERS.find(
      (p) =>
        p.username.toLowerCase() === idStr ||
        p.username.replace(/\./g, '').toLowerCase() === cleanIdStr ||
        p.id.toLowerCase() === idStr ||
        p.name.toLowerCase() === idStr
    ) || null
  );
};
