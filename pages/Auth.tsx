import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Languages, Mail, Lock, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/learn');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-full max-w-md bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/90 backdrop-blur-2xl border-2 border-neon-cyan/30 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.5), 0 0 50px rgba(0, 243, 255, 0.15), inset 0 2px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-neon-cyan/60 via-neon-cyan to-neon-cyan/80" />
        
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
           <div 
            className="p-5 rounded-2xl relative overflow-hidden border-2 border-neon-cyan/60"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.2) 0%, rgba(0, 243, 255, 0.3) 50%, rgba(0, 243, 255, 0.4) 100%)',
              boxShadow: '0 8px 30px rgba(0, 243, 255, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1), 0 0 40px rgba(0, 243, 255, 0.2)'
            }}
           >
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-2xl pointer-events-none" />
            <Languages className="w-12 h-12 text-neon-cyan relative z-10" />
           </div>
        </motion.div>

        <h2 className="text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {isLogin ? 'Welcome Back' : 'Initialize System'}
        </h2>
        <p className="text-center text-slate-500 mb-8 font-mono text-sm">
          {isLogin ? 'Authenticate to access neural link.' : 'Create a new user protocol.'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan/70 group-focus-within:text-neon-cyan transition-colors" size={22} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/60 border-2 border-neon-cyan/30 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-neon-cyan/70 focus:bg-slate-800/80 focus:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all text-base"
              required
            />
          </motion.div>

          <motion.div 
            className="relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan/70 group-focus-within:text-neon-cyan transition-colors" size={22} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/60 border-2 border-neon-cyan/30 rounded-2xl py-4 pl-14 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-neon-cyan/70 focus:bg-slate-800/80 focus:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all text-base"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white text-slate-900 font-medium hover:bg-slate-100 transition-all"
          >
            {isLogin ? 'Enter System' : 'Create Account'}
            <ArrowRight size={18} />
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};