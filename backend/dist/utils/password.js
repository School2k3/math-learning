import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;
/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
};
/**
 * Compare a plain text password with a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns True if the password matches the hash, false otherwise
 */
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
