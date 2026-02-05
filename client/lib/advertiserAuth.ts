// Advertiser authentication and credential management

export interface AdvertiserCredentials {
  email: string;
  password: string;
  companyName: string;
  registeredAt: string;
  verified: boolean;
}

const ADVERTISER_STORAGE_KEY = "advertiser_credentials";
const DEMO_ADVERTISER_PASSWORD_KEY = "demo_advertiser_password";

export const advertiserAuthService = {
  // Initialize demo advertiser if not exists
  initializeDemoAdvertiser: (): void => {
    try {
      const existing = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      const credentials = existing ? JSON.parse(existing) : [];

      // Check if demo advertiser already exists
      const demoExists = credentials.some(
        (cred: AdvertiserCredentials) =>
          cred.email === "advertiser@wellness.com",
      );

      if (!demoExists) {
        const demoAdvertiser: AdvertiserCredentials = {
          email: "advertiser@wellness.com",
          password: "admin123",
          companyName: "Demo Wellness Company",
          registeredAt: new Date().toISOString(),
          verified: true,
        };

        credentials.push(demoAdvertiser);
        localStorage.setItem(
          ADVERTISER_STORAGE_KEY,
          JSON.stringify(credentials),
        );
        console.log("✅ Demo advertiser initialized");
      }
    } catch (error) {
      console.error("Error initializing demo advertiser:", error);
    }
  },

  // Register a new advertiser
  registerAdvertiser: (
    email: string,
    companyName: string,
  ): { password: string; success: boolean } => {
    try {
      const existing = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      const credentials: AdvertiserCredentials[] = existing
        ? JSON.parse(existing)
        : [];

      // Check if email already exists
      if (credentials.some((cred) => cred.email === email)) {
        return { password: "", success: false };
      }

      // Generate a random password
      const password = generateRandomPassword();

      const newAdvertiser: AdvertiserCredentials = {
        email,
        password,
        companyName,
        registeredAt: new Date().toISOString(),
        verified: false,
      };

      credentials.push(newAdvertiser);
      localStorage.setItem(ADVERTISER_STORAGE_KEY, JSON.stringify(credentials));

      console.log(
        `✅ Advertiser registered: ${email} with password: ${password}`,
      );
      return { password, success: true };
    } catch (error) {
      console.error("Error registering advertiser:", error);
      return { password: "", success: false };
    }
  },

  // Verify advertiser login
  verifyLogin: (email: string, password: string): boolean => {
    try {
      const stored = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      if (!stored) return false;

      const credentials: AdvertiserCredentials[] = JSON.parse(stored);
      const advertiser = credentials.find(
        (cred) =>
          cred.email.toLowerCase() === email.toLowerCase() &&
          cred.password === password,
      );

      return advertiser !== undefined;
    } catch (error) {
      console.error("Error verifying login:", error);
      return false;
    }
  },

  // Get advertiser by email
  getAdvertiserByEmail: (email: string): AdvertiserCredentials | null => {
    try {
      const stored = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      if (!stored) return null;

      const credentials: AdvertiserCredentials[] = JSON.parse(stored);
      return (
        credentials.find(
          (cred) => cred.email.toLowerCase() === email.toLowerCase(),
        ) || null
      );
    } catch (error) {
      console.error("Error getting advertiser:", error);
      return null;
    }
  },

  // Get all advertisers
  getAllAdvertisers: (): AdvertiserCredentials[] => {
    try {
      const stored = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error getting all advertisers:", error);
      return [];
    }
  },

  // Update advertiser password
  updatePassword: (email: string, newPassword: string): boolean => {
    try {
      const stored = localStorage.getItem(ADVERTISER_STORAGE_KEY);
      if (!stored) return false;

      const credentials: AdvertiserCredentials[] = JSON.parse(stored);
      const index = credentials.findIndex(
        (cred) => cred.email.toLowerCase() === email.toLowerCase(),
      );

      if (index === -1) return false;

      credentials[index].password = newPassword;
      localStorage.setItem(ADVERTISER_STORAGE_KEY, JSON.stringify(credentials));

      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  },

  // Clear all advertiser data (for testing)
  clearAllAdvertisers: (): void => {
    try {
      localStorage.removeItem(ADVERTISER_STORAGE_KEY);
      console.log("✅ All advertiser credentials cleared");
    } catch (error) {
      console.error("Error clearing advertiser data:", error);
    }
  },
};

// Generate a random password
function generateRandomPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
