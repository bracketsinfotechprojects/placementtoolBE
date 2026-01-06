import * as bcrypt from 'bcrypt';

/**
 * Password utility class for handling password encryption and verification
 */
export default class PasswordUtility {
    // Salt rounds for bcrypt (higher = more secure but slower)
    private static readonly SALT_ROUNDS = 12;

    /**
     * Hash a plain text password using bcrypt
     * @param password - Plain text password to hash
     * @returns Promise<string> - Hashed password
     */
    static async hashPassword(password: string): Promise<string> {
        try {
            if (!password || password.trim().length === 0) {
                throw new Error('Password cannot be empty');
            }

            const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            console.error('❌ Error hashing password:', error);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Verify a plain text password against a hashed password
     * @param password - Plain text password to verify
     * @param hashedPassword - Hashed password to compare against
     * @returns Promise<boolean> - True if password matches, false otherwise
     */
    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        try {
            if (!password || !hashedPassword) {
                return false;
            }

            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('❌ Error verifying password:', error);
            return false;
        }
    }

    /**
     * Validate password strength
     * @param password - Password to validate
     * @returns object with validation result and message
     */
    static validatePasswordStrength(password: string): { isValid: boolean; message: string } {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }

        if (password.length < 8) {
            return { isValid: false, message: 'Password must be at least 8 characters long' };
        }

        if (password.length > 128) {
            return { isValid: false, message: 'Password must be less than 128 characters long' };
        }

        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one uppercase letter' };
        }

        // Check for at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one lowercase letter' };
        }

        // Check for at least one number
        if (!/\d/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one number' };
        }

        // Check for at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return { isValid: false, message: 'Password must contain at least one special character' };
        }

        return { isValid: true, message: 'Password is strong' };
    }

    /**
     * Generate a random password
     * @param length - Length of the password (default: 12)
     * @returns string - Generated password
     */
    static generateRandomPassword(length: number = 12): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';

        // Ensure at least one character from each category
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
}