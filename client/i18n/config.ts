import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const SUPPORTED_LANGUAGES = {
  en: { name: "English", flag: "🇬🇧" },
  zh: { name: "中文", flag: "🇨🇳" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ar: { name: "العربية", flag: "🇸🇦" },
  fr: { name: "Français", flag: "🇫🇷" },
  ko: { name: "한국어", flag: "🇰🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  pt: { name: "Português", flag: "🇵🇹" },
};

// Inline English translations (base language)
const enTranslations = {
  common: {
    nav: {
      login: "Login",
      signup: "Sign Up",
      features: "Features",
      pricing: "Pricing",
      about: "About",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      dashboard: "Dashboard",
      profile: "Profile",
      logout: "Logout",
      wellness: "Wellness Insights",
      bonds: "My Bonds",
      memories: "Shared Memories",
      partners: "Featured Partners",
      analytics: "Analytics",
    },
    footer: {
      description: "Your daily wellness companion",
      product: "Product",
      company: "Company",
      legal: "Legal",
      rights: "All rights reserved",
      followUs: "Follow Us",
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      language: "Language",
      theme: "Theme",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      yes: "Yes",
      no: "No",
      confirm: "Confirm",
      settings: "Settings",
      help: "Help",
      support: "Support",
      visitors: "Visitors",
      interactions: "Interactions",
    },
    messages: {
      loadingError: "Failed to load content. Please try again.",
      networkError: "Network error. Please check your connection.",
      unauthorizedError: "You are not authorized to access this resource.",
      notFoundError: "The resource you are looking for was not found.",
      serverError: "Server error. Please try again later.",
      confirmDelete: "Are you sure you want to delete this?",
      savingChanges: "Saving changes...",
      changessSaved: "Changes saved successfully.",
      deleteSuccess: "Deleted successfully.",
      deleteError: "Failed to delete. Please try again.",
    },
  },
  home: {
    hero: {
      mainTitle: "Check In,",
      subTitle: "Stay Connected",
      description:
        "UOK is your daily wellness companion. Check in 2-3 times a day to let your loved ones know you're okay.",
      cta: "Get Started",
      learnMore: "Learn More",
      createAccount: "Create Your Free Account",
    },
    features: {
      title: "Why Choose UOK?",
      feature1: {
        title: "Daily Check-Ins",
        description:
          "Simple 2-3 minute wellness checks to share your mood and status with loved ones",
      },
      feature2: {
        title: "Smart Insights",
        description:
          "AI-powered wellness insights and personalized recommendations based on your check-in patterns",
      },
      feature3: {
        title: "Peace of Mind",
        description:
          "Know that your loved ones care about your wellness with instant notifications",
      },
      feature4: {
        title: "Secure & Private",
        description:
          "Your data is encrypted and protected. Only share with people you trust",
      },
      feature5: {
        title: "Memory Sharing",
        description:
          "Create lasting memories by sharing wellness journeys with your community",
      },
      feature6: {
        title: "Partner Rewards",
        description:
          "Unlock exclusive offers from wellness partners when you maintain consistent check-ins",
      },
    },
    howItWorks: {
      title: "How It Works",
      step1: {
        title: "Sign Up",
        description: "Create your account and set up your wellness circle",
      },
      step2: {
        title: "Check In",
        description: "Share your daily mood and wellness status 2-3 times per day",
      },
      step3: {
        title: "Connect",
        description:
          "Invite loved ones to your wellness circle and get instant updates",
      },
      step4: {
        title: "Thrive",
        description:
          "Get personalized insights and grow together with your community",
      },
    },
    testimonials: {
      title: "What Our Users Say",
      testimonial1: {
        text: "UOK helps me stay connected with my family. Simple, elegant, and effective.",
        author: "Sarah M.",
      },
      testimonial2: {
        text: "Finally a wellness app that feels natural and not intrusive. Love it!",
        author: "John D.",
      },
      testimonial3: {
        text: "The insights have genuinely helped me understand my wellness patterns better.",
        author: "Emma L.",
      },
    },
    cta: {
      title: "Ready to prioritize your wellness?",
      description: "Join thousands of users building healthier communities",
      button: "Get Started for Free",
    },
  },
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Login to your UOK account and stay connected",
      email: "Email Address",
      password: "Password",
      rememberMe: "Remember me for 30 days",
      forgotPassword: "Forgot?",
      signin: "Sign In",
      noAccount: "Don't have an account?",
      signup: "Sign Up",
      loggingIn: "Logging in...",
      loginSuccess: "Logged in successfully",
      loginError: "Failed to login. Please try again.",
    },
    signup: {
      title: "Create Account",
      subtitle: "Join UOK and stay connected with your loved ones",
      fullName: "Full Name",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      createAccount: "Create Account",
      haveAccount: "Already have an account?",
      login: "Sign In",
      creatingAccount: "Creating account...",
      tos: "By signing up, you agree to our",
      tosLink: "Terms of Service",
      and: "and",
      privacyLink: "Privacy Policy",
      signupSuccess: "Account created successfully!",
      signupError: "Failed to create account. Please try again.",
    },
    passwordReset: {
      title: "Reset Password",
      subtitle: "Enter your email to receive a reset link",
      email: "Email Address",
      sendReset: "Send Reset Link",
      backToLogin: "Back to Login",
      resetSent: "Password reset link sent to your email",
      resetError: "Failed to send reset link. Please try again.",
    },
    validation: {
      nameRequired: "Name is required",
      emailRequired: "Email is required",
      emailInvalid: "Please enter a valid email",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      passwordMismatch: "Passwords do not match",
      confirmPasswordRequired: "Please confirm your password",
    },
  },
  dashboard: {
    dashboard: {
      title: "Daily Wellness Check-In",
      subtitle: "How are you feeling today?",
      selectMood: "Select your mood:",
      selectedMood: "You selected:",
      selectTimeSlot: "When did you check in?",
      timeSlots: {
        morning: "Morning",
        afternoon: "Afternoon",
        evening: "Evening",
      },
      submit: "Submit Check-In",
      submitting: "Submitting...",
      submitSuccess: "Check-in recorded successfully!",
      submitError: "Failed to submit check-in. Please try again.",
      suggestions: "Wellness Suggestions",
      closeModal: "Close suggestions",
    },
    moods: {
      happy: "Happy",
      sad: "Sad",
      anxious: "Anxious",
      excited: "Excited",
      tired: "Tired",
      angry: "Angry",
      calm: "Calm",
      stressed: "Stressed",
      peaceful: "Peaceful",
      frustrated: "Frustrated",
      confident: "Confident",
      lonely: "Lonely",
      hopeful: "Hopeful",
      confused: "Confused",
      energetic: "Energetic",
      neutral: "Neutral",
      grateful: "Grateful",
      scared: "Scared",
      motivated: "Motivated",
      overwhelmed: "Overwhelmed",
    },
    affirmations: {
      header: "Affirmation for you",
    },
    suggestions: {
      header: "Actionable Suggestions",
      activities: "Recommended Activities",
    },
    recentCheckins: {
      title: "Recent Check-Ins",
      noData: "No check-ins yet",
      date: "Date",
      mood: "Mood",
      timeSlot: "Time",
    },
    weeklyTrend: {
      title: "Weekly Wellness Trend",
      noData: "Not enough data for weekly trend",
    },
    contacts: {
      title: "My Wellness Circle",
      description: "People who care about your wellness",
      addContact: "Add Contact",
      noContacts: "No contacts added yet",
      setupNow: "Set up your wellness circle",
      lastCheckIn: "Last check-in",
      never: "Never",
    },
  },
  contact: {
    contact: {
      title: "Get in Touch",
      subtitle:
        "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      name: "Your Name",
      namePlaceholder: "John Doe",
      email: "Email Address",
      emailPlaceholder: "you@example.com",
      message: "Message",
      messagePlaceholder: "Tell us how we can help...",
      sendMessage: "Send Message",
      sending: "Sending...",
      successMessage: "Thank you for reaching out! We'll get back to you soon.",
      errorMessage: "Failed to send message. Please try again.",
      validation: {
        nameRequired: "Please enter your name",
        emailRequired: "Please enter your email",
        emailInvalid: "Please enter a valid email address",
        messageRequired: "Please enter your message",
        messageMinLength: "Message must be at least 10 characters",
      },
    },
    contactInfo: {
      title: "Contact Information",
      email: "Email",
      phone: "Phone",
      address: "Address",
      hours: "Business Hours",
    },
  },
  pages: {
    about: {
      title: "About UOK",
      description: "Learn more about our mission and values",
      mission: {
        title: "Our Mission",
        content:
          "At UOK, we believe that wellness is a shared responsibility. We're dedicated to creating a platform that empowers people to check in with their loved ones and build stronger, healthier communities.",
      },
      values: {
        title: "Our Values",
        privacy: "Privacy & Security",
        privacy_content:
          "Your data is sacred. We implement industry-leading encryption and never share your information without consent.",
        simplicity: "Simplicity",
        simplicity_content:
          "Wellness shouldn't be complicated. Our app is designed to be intuitive and quick.",
        community: "Community",
        community_content:
          "We believe in the power of communities to support wellness. Together, we're stronger.",
      },
      team: {
        title: "Our Team",
        content:
          "Built by wellness enthusiasts and technology experts dedicated to making wellness accessible to everyone.",
      },
    },
    pricing: {
      title: "Simple, Transparent Pricing",
      subtitle: "Choose the perfect plan for your wellness journey",
      free: {
        name: "Free Forever Plan",
        price: "Free",
        description: "Perfect for getting started",
        features: [
          "Unlimited daily check-ins (2-3 times per day)",
          "Mood tracking and insights",
          "5 wellness contacts",
          "Weekly wellness reports",
          "Mobile app access",
        ],
        cta: "Get Started",
      },
      pro: {
        name: "Pro Plan",
        price: "$4.99/month",
        description: "For serious wellness enthusiasts",
        features: [
          "Everything in Free",
          "Unlimited wellness contacts",
          "Advanced AI insights",
          "Custom affirmations",
          "Export wellness data",
          "Priority support",
        ],
        cta: "Start Free Trial",
      },
      family: {
        name: "Family Plan",
        price: "$9.99/month",
        description: "For families and groups",
        features: [
          "Everything in Pro",
          "Support for up to 10 family members",
          "Family wellness insights",
          "Shared memory albums",
          "Custom themes",
          "Dedicated support",
        ],
        cta: "Start Free Trial",
      },
    },
    features: {
      title: "All Features",
      dailyCheckins: {
        title: "Daily Wellness Check-Ins",
        description: "Simple, quick check-ins to share your mood and status",
      },
      moodTracking: {
        title: "Comprehensive Mood Tracking",
        description: "Track 20+ different mood states and emotions",
      },
      aiInsights: {
        title: "AI-Powered Insights",
        description:
          "Get personalized wellness recommendations based on your patterns",
      },
      sharedMemories: {
        title: "Shared Memory Hub",
        description:
          "Create and share wellness memories with your community",
      },
      partnerIntegration: {
        title: "Partner Wellness Programs",
        description: "Unlock exclusive offers from wellness partners",
      },
      dataExport: {
        title: "Data Export",
        description: "Export your wellness data anytime",
      },
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last updated",
      introduction:
        "Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.",
      sections: {
        informationCollection: {
          title: "Information We Collect",
          content:
            "We collect information you provide directly (account, mood data, contacts) and automatically (usage data, device info).",
        },
        informationUse: {
          title: "How We Use Your Information",
          content:
            "We use your information to provide and improve our services, send communications, and comply with legal obligations.",
        },
        informationSharing: {
          title: "How We Share Your Information",
          content:
            "We don't sell your data. We only share with service providers who help us operate the platform.",
        },
        dataSecurity: {
          title: "Data Security",
          content:
            "We use encryption and industry-standard security practices to protect your information.",
        },
        yourRights: {
          title: "Your Privacy Rights",
          content:
            "You have the right to access, correct, or delete your personal information at any time.",
        },
        contact: {
          title: "Contact Us",
          content:
            "If you have privacy concerns, please contact us at support@youok.fit",
        },
      },
    },
    terms: {
      title: "Terms of Service",
      lastUpdated: "Last updated",
      introduction:
        "These Terms of Service govern your use of our website and app. By accessing or using UOK, you agree to be bound by these terms.",
      sections: {
        useGuidelines: {
          title: "Acceptable Use",
          content:
            "You agree not to use our platform for illegal activities, harassment, or any harmful purposes.",
        },
        intellectualProperty: {
          title: "Intellectual Property",
          content:
            "All content and materials on our platform are owned by or licensed to us. You may not reproduce or redistribute without permission.",
        },
        limitation: {
          title: "Limitation of Liability",
          content:
            "To the maximum extent permitted, we are not liable for indirect, incidental, or consequential damages.",
        },
        disclaimer: {
          title: "Disclaimer",
          content:
            "UOK is provided 'as is' without warranties of any kind, express or implied.",
        },
        termination: {
          title: "Termination",
          content:
            "We reserve the right to suspend or terminate accounts that violate these terms.",
        },
        changes: {
          title: "Changes to Terms",
          content:
            "We may update these terms at any time. Continued use indicates acceptance of updated terms.",
        },
      },
    },
    notFound: {
      title: "Page Not Found",
      description: "Oops! The page you're looking for doesn't exist.",
      goHome: "Go Home",
    },
  },
  validation: {
    validation: {
      required: "This field is required",
      email: "Please enter a valid email address",
      minLength: "Must be at least {{min}} characters",
      maxLength: "Must not exceed {{max}} characters",
      pattern: "Invalid format",
      passwordMinLength: "Password must be at least 6 characters",
      passwordStrength:
        "Password must contain letters, numbers, and special characters",
      passwordMismatch: "Passwords do not match",
      nameFormat: "Name can only contain letters, spaces, and hyphens",
      phoneInvalid: "Please enter a valid phone number",
      urlInvalid: "Please enter a valid URL",
      numberInvalid: "Please enter a valid number",
      selectOne: "Please select one option",
    },
    errors: {
      generic: "An error occurred. Please try again.",
      network: "Network error. Please check your connection.",
      timeout: "Request timed out. Please try again.",
      unauthorized: "You are not authorized to perform this action.",
      forbidden:
        "You do not have permission to access this resource.",
      notFound: "The requested resource was not found.",
      conflict: "This resource already exists.",
      server: "Server error. Please try again later.",
      badRequest: "Invalid request. Please check your input.",
      validation: "Please correct the errors below",
    },
    success: {
      saved: "Changes saved successfully",
      created: "Item created successfully",
      updated: "Item updated successfully",
      deleted: "Item deleted successfully",
      sent: "Message sent successfully",
    },
  },
};

// Create resources with English as fallback for all languages
const resources = {
  en: enTranslations,
  zh: enTranslations, // Placeholder - will use English until proper translations available
  ja: enTranslations,
  ar: enTranslations,
  fr: enTranslations,
  ko: enTranslations,
  es: enTranslations,
  pt: enTranslations,
};

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("preferredLanguage")
    : "en";

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage || "en",
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "home", "auth", "dashboard", "contact", "pages", "validation"],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
