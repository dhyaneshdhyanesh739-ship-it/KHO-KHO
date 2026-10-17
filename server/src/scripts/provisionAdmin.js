import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const provisionAdmins = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kho-kho-arena';
  await mongoose.connect(uri);
  console.log('[Admin Provisioning] Connected to MongoDB.');

  const superUser = process.env.INITIAL_SUPER_ADMIN_USER || 'superadmin';
  const superPass = process.env.INITIAL_SUPER_ADMIN_PASSWORD || 'SuperAdmin@KhoKho2026!';

  const boysUser = process.env.INITIAL_BOYS_ADMIN_USER || 'boysadmin';
  const boysPass = process.env.INITIAL_BOYS_ADMIN_PASSWORD || 'BoysAdmin@KhoKho2026!';

  const girlsUser = process.env.INITIAL_GIRLS_ADMIN_USER || 'girlsadmin';
  const girlsPass = process.env.INITIAL_GIRLS_ADMIN_PASSWORD || 'GirlsAdmin@KhoKho2026!';

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

  console.log('[Admin Provisioning] Completed successfully.');
  process.exit(0);
};

provisionAdmins().catch((err) => {
  console.error('[Admin Provisioning] Error:', err);
  process.exit(1);
});
