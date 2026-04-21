import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'signup' | 'forgot';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' ? 'Enter your credentials to access your smart inbox' : 
             mode === 'signup' ? 'Join the next generation of email intelligence' : 
             'Enter your email to receive recovery link'}
          </p>
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
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Start Journey' : 'Send Link'}
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
                Don't have an account? <span className="font-semibold">Sign Up</span>
              </button>
              <button type="button" onClick={() => setMode('forgot')} className="auth-secondary-link">
                Forgot your password?
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setMode('login')} className="auth-link">
              Already have an account? <span className="font-semibold">Sign In</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
