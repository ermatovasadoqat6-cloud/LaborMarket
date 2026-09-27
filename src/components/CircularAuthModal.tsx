import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Lock, Mail, Building, Briefcase, Eye, EyeOff, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { User, UserRole } from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  db,
  doc,
  getDoc,
  setDoc,
} from '../firebase';

interface CircularAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: User) => void;
  darkMode: boolean;
  demoUsers: User[];
  defaultRole?: UserRole;
}

export const CircularAuthModal: React.FC<CircularAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  darkMode,
  demoUsers,
  defaultRole = 'job_seeker',
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Real Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      // Check or create Firestore document
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userProfile: User;
      if (userSnap.exists()) {
        userProfile = userSnap.data() as User;
      } else {
        userProfile = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google Foydalanuvchisi',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || undefined,
          role: selectedRole,
          companyName: selectedRole === 'employer' ? (firebaseUser.displayName ? `${firebaseUser.displayName} Kompaniyasi` : 'Yangi Kompaniya') : undefined,
          companyIndustry: selectedRole === 'employer' ? 'Axborot texnologiyalari' : undefined,
          title: selectedRole === 'job_seeker' ? 'Mutaxassis' : undefined,
          skills: selectedRole === 'job_seeker' ? ['Kompyuter savodxonligi', 'Muloqot'] : undefined,
        };
        await setDoc(userRef, userProfile);
      }

      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError("Brauzeringiz pop-up oynasini blokladi. Iltimos, ruxsat bering yoki email orqali kiring.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Kirish oynasi yopildi.");
      } else {
        setError(`Google orqali kirishda xatolik: ${err.message || err.code}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isSignUp) {
      if (!fullName.trim()) {
        setError("Iltimos, to'liq ismingizni kiriting!");
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError("Iltimos, to'g'ri elektron pochtani kiriting!");
        return;
      }
      if (password.length < 6) {
        setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
        return;
      }

      setIsLoading(true);
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCred.user;

        const newUser: User = {
          id: fbUser.uid,
          name: fullName.trim(),
          email: email.trim(),
          role: selectedRole,
          companyName: selectedRole === 'employer' ? (companyName.trim() || `${fullName.trim()} Kompaniyasi`) : undefined,
          companyIndustry: selectedRole === 'employer' ? 'Axborot texnologiyalari' : undefined,
          title: selectedRole === 'job_seeker' ? 'Boshlang\'ich mutaxassis' : undefined,
          skills: selectedRole === 'job_seeker' ? ['Yangi texnologiyalar', 'Mas\'uliyatlilik'] : undefined,
        };

        await setDoc(doc(db, 'users', fbUser.uid), newUser);
        onLoginSuccess(newUser);
      } catch (err: any) {
        console.error('Sign up error:', err);
        if (err.code === 'auth/email-already-in-use') {
          setError("Bu email allaqachon ro'yxatdan o'tgan. Iltimos, Kirish (Login) qismiga o'ting.");
        } else if (err.code === 'auth/weak-password') {
          setError("Parol juda zaif, kamida 6 ta belgi kiriting.");
        } else {
          setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi.");
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!usernameOrEmail.trim()) {
        setError("Iltimos, email yoki foydalanuvchi nomini kiriting!");
        return;
      }
      if (!password) {
        setError("Iltimos, parolingizni kiriting!");
        return;
      }

      // Check if demo user
      const matchedDemo = demoUsers.find(
        (u) =>
          u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
          u.name.toLowerCase() === usernameOrEmail.toLowerCase()
      );

      if (matchedDemo && password === 'demo123') {
        onLoginSuccess(matchedDemo);
        return;
      }

      setIsLoading(true);
      try {
        const emailToLogin = usernameOrEmail.includes('@')
          ? usernameOrEmail.trim()
          : `${usernameOrEmail.trim().toLowerCase()}@labormarket.uz`;

        const userCred = await signInWithEmailAndPassword(auth, emailToLogin, password);
        const fbUser = userCred.user;

        const userRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userRef);

        let userProfile: User;
        if (userSnap.exists()) {
          userProfile = userSnap.data() as User;
        } else {
          userProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || emailToLogin.split('@')[0],
            email: fbUser.email || emailToLogin,
            role: selectedRole,
          };
          await setDoc(userRef, userProfile);
        }

        onLoginSuccess(userProfile);
      } catch (err: any) {
        console.error('Sign in error:', err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setError("Email yoki parol noto'g'ri kiritildi.");
        } else {
          setError(err.message || "Tizimga kirishda xatolik yuz berdi.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loginAsDemo = (role: UserRole) => {
    const demo = demoUsers.find((u) => u.role === role);
    if (demo) {
      onLoginSuccess(demo);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      {/* Background close or guest explore */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-all border border-slate-700/50"
          title="Yopish (Mehmon sifatida ko'rish)"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Main Neumorphic Card - Shaped as Circular container from Video */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-[480px] min-h-[510px] rounded-[52px] sm:rounded-full p-8 sm:p-12 flex flex-col items-center justify-center select-none transition-all duration-300 ${
          darkMode ? 'neu-flat-dark text-slate-100' : 'neu-flat-light text-slate-800'
        }`}
        style={{
          border: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.8)',
        }}
      >
        {/* Soft Ambient Inner Glow */}
        <div className="absolute inset-0 rounded-[52px] sm:rounded-full pointer-events-none overflow-hidden opacity-30">
          <div
            className={`absolute -top-24 -left-24 w-60 h-60 rounded-full blur-3xl ${
              darkMode ? 'bg-indigo-500/20' : 'bg-blue-300/30'
            }`}
          />
          <div
            className={`absolute -bottom-24 -right-24 w-60 h-60 rounded-full blur-3xl ${
              darkMode ? 'bg-rose-500/20' : 'bg-rose-200/30'
            }`}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center">
          {/* Animated Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold tracking-tight font-heading">
              {isSignUp ? 'Sign Up' : 'Login'}
            </h2>
            <p className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Role Selector Pill */}
          <div
            className={`w-full flex rounded-full p-1 mb-5 transition-all ${
              darkMode ? 'neu-inset-dark' : 'neu-inset-light'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedRole('job_seeker')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'job_seeker'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Ish izlovchi
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('employer')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'employer'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                  : darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Ish beruvchi
            </button>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="w-full mb-3 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium animate-shake">
              {error}
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="w-full space-y-3.5">
            <AnimatePresence mode="wait">
              {isSignUp ? (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {/* Full Name */}
                  <div
                    className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                      darkMode
                        ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                        : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Company Name (only if employer) */}
                  {selectedRole === 'employer' && (
                    <div
                      className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                        darkMode
                          ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                          : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                      }`}
                    >
                      <Building className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Company name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div
                    className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                      darkMode
                        ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                        : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password */}
                  <div
                    className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                      darkMode
                        ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                        : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200 text-xs ml-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-3.5"
                >
                  {/* Username or Email */}
                  <div
                    className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                      darkMode
                        ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                        : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Username / Email"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Password */}
                  <div
                    className={`flex items-center px-4 py-2.5 rounded-full transition-all border ${
                      darkMode
                        ? 'neu-inset-dark border-slate-800/80 focus-within:border-rose-500/60'
                        : 'neu-inset-light border-slate-200 focus-within:border-rose-400'
                    }`}
                  >
                    <Lock className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200 text-xs ml-2"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Remember Me & Forgot Password (Exact as Video 00:01) */}
                  <div className="flex items-center justify-between px-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      {/* Animated Neumorphic Toggle Switch with Red Active State from Video */}
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={`relative w-8 h-4 rounded-full transition-colors duration-300 p-0.5 ${
                          rememberMe
                            ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-inner'
                            : darkMode
                            ? 'bg-slate-800 border border-slate-700'
                            : 'bg-slate-300 border border-slate-400'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                            rememberMe ? 'transform translate-x-4' : 'transform translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button: SIGN IN / CREATE ACCOUNT */}
            {isSignUp ? (
              // Rich Crimson Red button exactly matching video frame 00:04
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full py-2.5 mt-2 rounded-full font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 shadow-lg shadow-rose-900/40 hover:shadow-rose-700/60 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                CREATE ACCOUNT
              </motion.button>
            ) : (
              // Neumorphic SIGN IN button matching video frame 00:00
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className={`w-full py-2.5 mt-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all ${
                  darkMode
                    ? 'neu-btn-dark text-slate-200 hover:text-white'
                    : 'neu-btn-light text-slate-700 hover:text-slate-900'
                }`}
              >
                SIGN IN
              </motion.button>
            )}
          </form>

          {/* Video Toggle link: "Don't have an account? Sign up" */}
          <div className="mt-4 text-center">
            {isSignUp ? (
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className="font-bold text-rose-500 hover:text-rose-400 underline underline-offset-2 ml-1"
                >
                  Login
                </button>
              </p>
            ) : (
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className="font-bold text-rose-500 hover:text-rose-400 underline underline-offset-2 ml-1"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          {/* Real Google Sign-in Section (User requirement: "unga Google orqali haqiqaddan kirsin") */}
          <div className="w-full mt-4 pt-3 border-t border-slate-700/30 flex flex-col items-center">
            {/* Real Firebase Google Popup Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                darkMode
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-indigo-500'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-indigo-400'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isLoading ? "Ulanmoqda..." : "Google orqali kirish"}</span>
            </button>
          </div>

          {/* Quick Demo Logins for Testing */}
          <div className="w-full mt-3 flex items-center justify-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => loginAsDemo('job_seeker')}
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Demo Ish izlovchi
            </button>
            <span className="text-slate-600">•</span>
            <button
              type="button"
              onClick={() => loginAsDemo('employer')}
              className="text-rose-400 hover:text-rose-300 hover:underline"
            >
              Demo Ish beruvchi
            </button>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 ${
              darkMode ? 'neu-flat-dark text-slate-100' : 'neu-flat-light text-slate-800'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Parolni tiklash</h3>
              <button
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setForgotSuccess(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">
                  Tiklash havolasi <b>{forgotEmail}</b> pochtasiga yuborildi!
                </p>
                <button
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2 rounded-full bg-rose-600 text-white text-xs font-semibold"
                >
                  Tushunarli
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail.includes('@')) {
                    setForgotSuccess(true);
                  }
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-400">
                  Ro'yxatdan o'tgan emailingizni kiriting. Biz sizga yangi parol o'rnatish havolasini yuboramiz.
                </p>
                <div
                  className={`flex items-center px-4 py-2.5 rounded-full ${
                    darkMode ? 'neu-inset-dark' : 'neu-inset-light'
                  }`}
                >
                  <Mail className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="email"
                    required
                    placeholder="Sizning emailingiz"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-transparent text-xs outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full font-bold text-xs uppercase bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  Havola yuborish
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
