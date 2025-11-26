// In-memory OTP store
// Stores email => OTP mapping with expiration time
// Using a Map to store OTPs in memory - no database required
const otpStore = new Map();
/**
 * Generate a random 6-digit OTP code
 * @returns A 6-digit OTP code as string
 */
export const generateOtp = () => {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Save an OTP for a specific email with an expiration time
 * @param email User's email
 * @param otp The OTP to save
 * @param ttlMinutes Time to live in minutes (default: 10)
 */
export const saveOtp = (email, otp, ttlMinutes = 10) => {
    otpStore.set(email, {
        otp,
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
    });
    console.log(`OTP saved for ${email}: ${otp}`);
};
/**
 * Verify if an OTP is valid for a specific email
 * @param email User's email
 * @param otp The OTP to verify
 * @returns True if the OTP is valid and not expired, false otherwise
 */
export const verifyOtp = (email, otp) => {
    const entry = otpStore.get(email);
    // If no entry exists for this email
    if (!entry) {
        console.log(`No OTP found for ${email}`);
        return false;
    }
    // If the OTP has expired
    if (entry.expiresAt < new Date()) {
        console.log(`OTP expired for ${email}`);
        otpStore.delete(email);
        return false;
    }
    // If the OTP doesn't match
    if (entry.otp !== otp) {
        console.log(`Invalid OTP for ${email}: expected ${entry.otp}, received ${otp}`);
        return false;
    }
    // OTP is valid, delete it from store to prevent reuse
    console.log(`Valid OTP for ${email}. OTP verified and removed from store.`);
    otpStore.delete(email);
    return true;
};
/**
 * Get all active OTPs (for debugging purposes only)
 * @returns Array of emails with active OTPs
 */
export const getActiveOtps = () => {
    return Array.from(otpStore.keys());
};
/**
 * Clear expired OTPs from the store
 * Can be called periodically to clean up the memory
 */
export const clearExpiredOtps = () => {
    const now = new Date();
    let count = 0;
    for (const [email, entry] of otpStore.entries()) {
        if (entry.expiresAt < now) {
            otpStore.delete(email);
            count++;
        }
    }
    if (count > 0) {
        console.log(`Cleared ${count} expired OTPs`);
    }
};
