export const translations = {
  en: {
    // Common
    language: "Language",
    amharic: "አማርኛ",
    english: "English",
    or: "OR",
    
    // User Type
    owner: "Owner",
    staff: "Staff",
    
    // Login Page
    login_title: "Sign In",
    login_subtitle: "Welcome back",
    username: "Username",
    password: "Password",
    sign_in: "Sign In",
    signing_in: "Signing in...",
    sign_in_google: "Sign in with Google",
    no_account: "Don't have an account?",
    sign_up_link: "Sign up",
    demo_credentials: "Demo Credentials:",
    demo_text: "Owner: admin/admin123 | Staff: staff/staff123",
    
    // Signup Page
    signup_title: "Sign Up",
    signup_subtitle: "Create your account",
    full_name: "Full Name",
    email: "Email",
    sign_up: "Sign Up",
    signing_up: "Creating account...",
    sign_up_google: "Sign up with Google",
    have_account: "Already have an account?",
    sign_in_link: "Sign in",
    
    // Messages
    login_success: "Logged in successfully!",
    login_error: "Failed to login",
    signup_success: "Account created successfully!",
    signup_error: "Failed to create account",
    google_login_success: "Logged in with Google!",
    google_login_error: "Failed to sign in with Google",
    google_signup_success: "Account created with Google!",
    google_signup_error: "Failed to sign up with Google",
  },
  am: {
    // Common
    language: "ቋንቋ",
    amharic: "አማርኛ",
    english: "English",
    or: "ወይም",
    
    // User Type
    owner: "ባለቤት",
    staff: "ሠራተኛ",
    
    // Login Page
    login_title: "ወደ ውስጥ ገባ",
    login_subtitle: "እንደገና ደህና መጡ",
    username: "ተጠቃሚ ስም",
    password: "ሚስጥር",
    sign_in: "ወደ ውስጥ ገባ",
    signing_in: "ወደ ውስጥ ገባ...",
    sign_in_google: "ከ Google ጋር ወደ ውስጥ ገባ",
    no_account: "መለያ የሌለዎት?",
    sign_up_link: "ይመዝገቡ",
    demo_credentials: "ሙከራ መለያዎች:",
    demo_text: "ባለቤት: admin/admin123 | ሠራተኛ: staff/staff123",
    
    // Signup Page
    signup_title: "ይመዝገቡ",
    signup_subtitle: "መለያዎን ይፍጠሩ",
    full_name: "ሙሉ ስም",
    email: "ኢሜል",
    sign_up: "ይመዝገቡ",
    signing_up: "መለያ ይፈጠራል...",
    sign_up_google: "ከ Google ጋር ይመዝገቡ",
    have_account: "መለያ አለዎት?",
    sign_in_link: "ወደ ውስጥ ገባ",
    
    // Messages
    login_success: "በተሳካ ሁኔታ ገብተዋል!",
    login_error: "ወደ ውስጥ መግባት ወደ ውስጥ ገባ",
    signup_success: "መለያ በተሳካ ሁኔታ ተፈጠረ!",
    signup_error: "መለያ መፍጠር ወደ ውስጥ ገባ",
    google_login_success: "ከ Google ጋር ገብተዋል!",
    google_login_error: "ከ Google ጋር መግባት ወደ ውስጥ ገባ",
    google_signup_success: "መለያ ከ Google ጋር ተፈጠረ!",
    google_signup_error: "ከ Google ጋር ምዝገባ ወደ ውስጥ ገባ",
  },
};

export type Language = "en" | "am";

export function t(key: keyof typeof translations.en, language: Language): string {
  const translationMap: Record<Language, Record<string, string>> = translations as any;
  return translationMap[language][key] || translations.en[key];
}
