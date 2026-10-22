import bcrypt from 'bcryptjs';
import { createModelAdapter } from './prismaAdapter.js';

const User = createModelAdapter('user');

// Static helper to hash password
User.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

export default User;
