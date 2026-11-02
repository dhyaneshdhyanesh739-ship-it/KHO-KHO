import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const provisionAdmins = async () => {
  await connectDB();
  console.log('[Admin Provisioning] Connected to PostgreSQL.');

  const superUser = process.env.INITIAL_SUPER_ADMIN_USER || 'superadmin';
  const superPass = process.env.INITIAL_SUPER_ADMIN_PASSWORD || 'SuperAdmin@KhoKho2026!';

  const boysUser = process.env.INITIAL_BOYS_ADMIN_USER || 'boysadmin';
  const boysPass = process.env.INITIAL_BOYS_ADMIN_PASSWORD || 'BoysAdmin@KhoKho2026!';

  const girlsUser = process.env.INITIAL_GIRLS_ADMIN_USER || 'girlsadmin';
  const girlsPass = process.env.INITIAL_GIRLS_ADMIN_PASSWORD || 'GirlsAdmin@KhoKho2026!';

  const vimalUser = process.env.EXTRA_BOYS_ADMIN_USER || 'Vimal';
  const vimalPass = process.env.EXTRA_BOYS_ADMIN_PASSWORD || 'Vimal@1234';

  const keerthanaUser = process.env.EXTRA_GIRLS_ADMIN_USER || 'Keerthana';
  const keerthanaPass = process.env.EXTRA_GIRLS_ADMIN_PASSWORD || 'keerthama@1234';

  // Provision Super Admin if not present
  let existingSuper = await User.findOne({ username: superUser.toLowerCase() });
  if (!existingSuper) {
    const hash = await User.hashPassword(superPass);
    existingSuper = await User.create({
      username: superUser.toLowerCase(),
      passwordHash: hash,
      name: 'Super Administrator',
      email: 'admin@khokhoarena.org',
      role: 'SUPER_ADMIN',
      team: 'ALL',
      isActive: true,
    });
    console.log(`[Admin Provisioning] Created Super Admin: ${superUser}`);
  } else {
    console.log(`[Admin Provisioning] Super Admin already exists.`);
  }

  // Provision Boys Admin if not present
  let existingBoys = await User.findOne({ username: boysUser.toLowerCase() });
  if (!existingBoys) {
    const hash = await User.hashPassword(boysPass);
    existingBoys = await User.create({
      username: boysUser.toLowerCase(),
      passwordHash: hash,
      name: 'Boys Team Administrator',
      email: 'boysadmin@khokhoarena.org',
      role: 'BOYS_ADMIN',
      team: 'BOYS',
      isActive: true,
    });
    console.log(`[Admin Provisioning] Created Boys Admin: ${boysUser}`);
  } else {
    console.log(`[Admin Provisioning] Boys Admin already exists.`);
  }

  // Provision Girls Admin if not present
  let existingGirls = await User.findOne({ username: girlsUser.toLowerCase() });
  if (!existingGirls) {
    const hash = await User.hashPassword(girlsPass);
    existingGirls = await User.create({
      username: girlsUser.toLowerCase(),
      passwordHash: hash,
      name: 'Girls Team Administrator',
      email: 'girlsadmin@khokhoarena.org',
      role: 'GIRLS_ADMIN',
      team: 'GIRLS',
      isActive: true,
    });
    console.log(`[Admin Provisioning] Created Girls Admin: ${girlsUser}`);
  } else {
    console.log(`[Admin Provisioning] Girls Admin already exists.`);
  }

  // Provision Extra Boys Admin: Vimal
  let existingVimal = await User.findOne({ username: vimalUser.toLowerCase() });
  if (!existingVimal) {
    const hash = await User.hashPassword(vimalPass);
    existingVimal = await User.create({
      username: vimalUser.toLowerCase(),
      passwordHash: hash,
      name: 'Coach Vimal',
      email: 'vimal@khokhoarena.org',
      role: 'BOYS_ADMIN',
      team: 'BOYS',
      isActive: true,
    });
    console.log(`[Admin Provisioning] Created Boys Admin: ${vimalUser} (${vimalPass})`);
  } else {
    const hash = await User.hashPassword(vimalPass);
    existingVimal.passwordHash = hash;
    existingVimal.role = 'BOYS_ADMIN';
    existingVimal.team = 'BOYS';
    existingVimal.isActive = true;
    await existingVimal.save();
    console.log(`[Admin Provisioning] Updated Boys Admin: ${vimalUser} (${vimalPass})`);
  }

  // Provision Extra Girls Admin: Keerthana
  let existingKeerthana = await User.findOne({ username: keerthanaUser.toLowerCase() });
  if (!existingKeerthana) {
    const hash = await User.hashPassword(keerthanaPass);
    existingKeerthana = await User.create({
      username: keerthanaUser.toLowerCase(),
      passwordHash: hash,
      name: 'Coach Keerthana',
      email: 'coach.keerthana@khokhoarena.org',
      role: 'GIRLS_ADMIN',
      team: 'GIRLS',
      isActive: true,
    });
    console.log(`[Admin Provisioning] Created Girls Admin: ${keerthanaUser} (${keerthanaPass})`);
  } else {
    const hash = await User.hashPassword(keerthanaPass);
    existingKeerthana.passwordHash = hash;
    existingKeerthana.role = 'GIRLS_ADMIN';
    existingKeerthana.team = 'GIRLS';
    existingKeerthana.isActive = true;
    await existingKeerthana.save();
    console.log(`[Admin Provisioning] Updated Girls Admin: ${keerthanaUser} (${keerthanaPass})`);
  }

  console.log('[Admin Provisioning] Completed successfully.');
  process.exit(0);
};

provisionAdmins().catch((err) => {
  console.error('[Admin Provisioning] Error:', err);
  process.exit(1);
});
