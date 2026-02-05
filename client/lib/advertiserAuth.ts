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
      let credentials: AdvertiserCredentials[] = [];

      // Parse existing credentials safely
      if (existing) {
        try {
          credentials = JSON.parse(existing);
          // Ensure it's an array
          if (!Array.isArray(credentials)) {
            credentials = [];
          }
        } catch (e) {
          console.warn("Invalid JSON in advertiser storage, resetting...");
          credentials = [];
        }
      }

      // Check if demo advertiser already exists
      const demoIndex = credentials.findIndex(
        (cred: AdvertiserCredentials) =>
          cred.email === "advertiser@wellness.com",
      );

      const demoAdvertiser: AdvertiserCredentials = {
        email: "advertiser@wellness.com",
        password: "admin123",
        companyName: "Demo Wellness Company",
        registeredAt: new Date().toISOString(),
        verified: true,
      };

      if (demoIndex === -1) {
        // Demo advertiser doesn't exist, add it
        credentials.push(demoAdvertiser);
        console.log("✅ Demo advertiser created");
      } else {
        // Demo advertiser exists, ensure password is correct
        credentials[demoIndex] = demoAdvertiser;
        console.log("✅ Demo advertiser verified/updated");
      }

      localStorage.setItem(ADVERTISER_STORAGE_KEY, JSON.stringify(credentials));
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

      // Sync to Supabase
      advertiserAuthService.syncToSupabase();

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
      if (!stored) {
        console.warn("No advertiser credentials found in storage");
        return false;
      }

      const credentials: AdvertiserCredentials[] = JSON.parse(stored);
      if (!Array.isArray(credentials)) {
        console.warn("Invalid credentials format");
        return false;
      }

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      const advertiser = credentials.find(
        (cred) =>
          cred.email.toLowerCase() === trimmedEmail &&
          cred.password === trimmedPassword,
      );

      if (advertiser) {
        console.log(`✅ Valid login found for: ${advertiser.email}`);
        return true;
      } else {
        // Debug: log available credentials
        console.log(
          "Available advertisers:",
          credentials.map((c) => c.email),
        );
        return false;
      }
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

      // Sync to Supabase
      advertiserAuthService.syncToSupabase();

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

  // Sync advertiser credentials to Supabase (fire-and-forget)
  syncToSupabase: (): void => {
    try {
      const credentials = advertiserAuthService.getAllAdvertisers();

      import("./supabase")
        .then(({ getSupabase }) => {
          const supabase = getSupabase();
          if (!supabase || credentials.length === 0) return;

          return Promise.all(
            credentials.map((cred) =>
              supabase.from("advertiser_credentials").upsert(
                {
                  email: cred.email,
                  password: cred.password,
                  company_name: cred.companyName,
                  registered_at: cred.registeredAt,
                  verified: cred.verified,
                },
                { onConflict: "email" },
              ),
            ),
          );
        })
        .then(() => console.log("✅ Advertiser credentials synced to Supabase"))
        .catch((error) => {
          console.log(
            "⚠️ Failed to sync advertiser credentials to Supabase:",
            error,
          );
        });
    } catch (error) {
      console.error("Error syncing advertiser credentials:", error);
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
