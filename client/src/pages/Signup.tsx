import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { t, type Language } from "../lib/translations";
import { checkIfFirstUserStrict } from "../lib/strictAdminCheck";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"owner" | "staff">("owner");
  const [language, setLanguage] = useState<Language>("en");

  // Use the strict admin check from the utility
  const checkIfFirstUser = checkIfFirstUserStrict;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if this is the first user BEFORE creating the account
      const isFirstUser = await checkIfFirstUser();
      console.log("Is first user:", isFirstUser);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore with correct role based on first-user check
      const userData = {
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        role: isFirstUser ? "admin" : "user",
        userType: userType,
        status: isFirstUser ? "approved" : "pending",
        approvedAt: isFirstUser ? new Date() : null,
        approvedBy: isFirstUser ? "system" : null,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      if (isFirstUser) {
        toast.success(t("signup_success", language) + " - You are the Admin!");
        window.location.href = "/admin-dashboard";
      } else {
        toast.success(t("signup_success", language) + " - Awaiting approval");
        window.location.href = "/approval-waiting";
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || t("signup_error", language));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      // Check if this is the first user BEFORE signing in
      const isFirstUser = await checkIfFirstUser();
      console.log("Is first user (Google):", isFirstUser);

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        // Create user document in Firestore with correct role
        const userData = {
          email: user.email,
          displayName: user.displayName || "User",
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          role: isFirstUser ? "admin" : "user",
          userType: userType,
          status: isFirstUser ? "approved" : "pending",
          approvedAt: isFirstUser ? new Date() : null,
          approvedBy: isFirstUser ? "system" : null,
          authProvider: "google",
        };

        await setDoc(doc(db, "users", user.uid), userData);

        if (isFirstUser) {
          toast.success(t("google_signup_success", language) + " - You are the Admin!");
          window.location.href = "/admin-dashboard";
        } else {
          toast.success(t("google_signup_success", language) + " - Awaiting approval");
          window.location.href = "/approval-waiting";
        }
      } else {
        // User already exists, redirect based on status
        const userData = userDoc.data();
        if (userData.status === "approved") {
          window.location.href = userData.role === "admin" ? "/admin-dashboard" : "/user-dashboard";
        } else {
          window.location.href = "/approval-waiting";
        }
      }
    } catch (error: any) {
      console.error("Google signup error:", error);
      toast.error(error.message || t("google_signup_error", language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center p-4" dir={language === "am" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border-2 border-cyan-400 flex items-center justify-center">
              <span className="text-cyan-400 text-2xl">≡</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">Eyob Store</h1>
          <p className="text-cyan-300 text-sm">Home & Kitchen Supplies</p>
        </div>

        {/* Language Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setLanguage("am")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              language === "am"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            {t("amharic", "am")}
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              language === "en"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            {t("english", "en")}
          </button>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setUserType("owner")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              userType === "owner"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            <span>👤</span>
            <span>{t("owner", language)}</span>
          </button>
          <button
            onClick={() => setUserType("staff")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              userType === "staff"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            <span>👥</span>
            <span>{t("staff", language)}</span>
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {t("full_name", language)}
            </label>
            <Input
              type="text"
              placeholder={t("full_name", language)}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {t("email", language)}
            </label>
            <Input
              type="email"
              placeholder={t("email", language)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {t("password", language)}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold py-3 rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all shadow-lg"
          >
            {loading ? t("signing_up", language) : t("sign_up", language)}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-400 text-sm">{t("or", language)}</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Google Sign-Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full bg-white text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-100 transition-all shadow-lg flex items-center justify-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t("sign_up_google", language)}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            {t("have_account", language)}{" "}
            <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              {t("sign_in_link", language)}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
