import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('Initializing intelligence sync... please wait');
      try {
        await authService.googleLogin(tokenResponse.access_token);
        
        // Background sync latest 100 emails
        authService.syncGmail(tokenResponse.access_token, 100).catch(e => console.error("Initial sync error", e));
        
        navigate('/dashboard');
      } catch (err: any) {
        setError('Gmail Intelligence Sync Failed');
      } finally {
        setLoading(false);
      }
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    onError: () => setError('Google Authentication Failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await authService.login({ email, password });
        navigate('/dashboard');
      } else if (mode === 'signup') {
        await authService.signup({ email, password });
        setMode('login');
        setError('Account created! Please login.');
      } else {
        await authService.forgotPassword({ email });
        setError('Check your email for reset instructions.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="bg-particle bg-blue-500/10"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 2 
            }}
            animate={{ 
              y: [null, Math.random() * -500],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ width: Math.random() * 100 + 50, height: Math.random() * 100 + 50 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="auth-card"
      >
        <div className="auth-header">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="auth-logo"
          >
            <Sparkles className="text-white w-8 h-8" />
          </motion.div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Neural Core Access' : mode === 'signup' ? 'Deploy New Node' : 'Recovery Sequence'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Authenticate to access the orchestration dashboard' : 
             mode === 'signup' ? 'Initialize your intelligence node' : 
             'Requesting password reset credentials'}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-4">
          <button 
            type="button" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white text-slate-900 rounded-xl font-black hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] group overflow-hidden relative"
            onClick={() => loginWithGoogle()}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="relative">Continue with Intelligence Sync</span>
          </button>
          
          <div className="relative w-full py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black"><span className="bg-[#0a0f1d] px-6 text-slate-600">Secure Protocol</span></div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="auth-form"
          >
            {mode === 'login' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 mb-6 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <p className="text-[10px] text-amber-500 font-bold leading-tight flex gap-2">
                  <span>⚠</span>
                  Standard Login: Direct Gmail intelligence is DISABLED. 
                  Login with Google to unlock real-time neural sync.
                </p>
              </motion.div>
            )}

            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== 'forgot' && (
              <div className="input-group">
                <Lock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="error-text"
              >
                {error}
              </motion.p>
            )}

            <button
              disabled={loading}
              className="btn-auth-submit"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  {mode === 'login' ? 'Initialize Session' : mode === 'signup' ? 'Execute Deployment' : 'Send Link'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-footer">
          {mode === 'login' ? (
            <>
              <button type="button" onClick={() => setMode('signup')} className="auth-link">
                Don't have an account? <span className="font-semibold text-indigo-400">Sign Up</span>
              </button>
              <button type="button" onClick={() => setMode('forgot')} className="auth-secondary-link">
                Forgot your password?
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setMode('login')} className="auth-link">
              Already have an account? <span className="font-semibold text-indigo-400">Sign In</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
