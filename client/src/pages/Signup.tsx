import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { doc, setDoc, getDoc } from "firebase/firestore";

export function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<"owner" | "staff">("owner");
  const [language, setLanguage] = useState<"amharic" | "english">("english");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: displayName,
        createdAt: new Date(),
        role: userType,
        userType: userType,
      });

      toast.success(language === "english" ? "Account created successfully!" : "መለያ በተሳካ ሁኔታ ተፈጠረ!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || (language === "english" ? "Failed to create account" : "መለያ መፍጠር ወደ ውስጥ ገባ"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Create user document in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName || "User",
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          role: userType,
          userType: userType,
          authProvider: "google",
        });
      }

      toast.success(language === "english" ? "Account created with Google!" : "መለያ ከ Google ጋር ተፈጠረ!");
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || (language === "english" ? "Failed to sign up with Google" : "ከ Google ጋር ምዝገባ ወደ ውስጥ ገባ"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center p-4">
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
            onClick={() => setLanguage("amharic")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              language === "amharic"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            አማርኛ
          </button>
          <button
            onClick={() => setLanguage("english")}
            className={`py-3 px-4 rounded-lg font-semibold transition-all ${
              language === "english"
                ? "bg-cyan-500 text-white border-2 border-cyan-400"
                : "bg-slate-800 text-slate-300 border-2 border-slate-700 hover:border-slate-600"
            }`}
          >
            English
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
            <span>{language === "english" ? "Owner" : "ባለቤት"}</span>
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
            <span>{language === "english" ? "Staff" : "ሠራተኛ"}</span>
          </button>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {language === "english" ? "Full Name" : "ሙሉ ስም"}
            </label>
            <Input
              type="text"
              placeholder={language === "english" ? "John Doe" : "ሙሉ ስም"}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {language === "english" ? "Email" : "ኢሜል"}
            </label>
            <Input
              type="email"
              placeholder={language === "english" ? "you@example.com" : "ኢሜል"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800 border-2 border-slate-700 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              {language === "english" ? "Password" : "ሚስጥር"}
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
            {loading ? (language === "english" ? "Creating account..." : "መለያ ይፈጠራል...") : language === "english" ? "Sign Up" : "ይመዝገቡ"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-400 text-sm">{language === "english" ? "OR" : "ወይም"}</span>
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
          {language === "english" ? "Sign up with Google" : "ከ Google ጋር ይመዝገቡ"}
        </button>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            {language === "english" ? "Already have an account? " : "መለያ አለዎት? "}
            <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              {language === "english" ? "Sign in" : "ወደ ውስጥ ገባ"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
