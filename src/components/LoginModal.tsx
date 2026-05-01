import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { useModal } from '../contexts/ModalContext';
import { X } from 'lucide-react';
import { firebaseSignup, firebaseResetPassword } from '../auth/firebaseClient';
import { ENABLE_SIGNUP } from '../config/appConfig';
import { createUser } from '../services/useService';

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export default function LoginModal() {
  const { isLoginOpen, closeLogin, onLoginSuccess } = useModal();
  const auth = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user'); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // ✅ 1. RESET STATE ON CLOSE
  // This ensures every time the modal opens, it starts at "Sign In" with no errors
  useEffect(() => {
    if (!isLoginOpen) {
      setMode('LOGIN');
      setError(null);
      setMsg(null);
      setPassword(''); // Clear password for security
      // We keep 'email' populated as a convenience to the user
    }
  }, [isLoginOpen]);

  // If modal is closed, don't render anything
  if (!isLoginOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent signup if disabled
    if (mode === 'SIGNUP' && !ENABLE_SIGNUP) {
      setError('Signup is not supported at this time. Please contact support.');
      return;
    }
    
    setError(null);
    setMsg(null);
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        await auth.loginWithEmail?.(email, password);
        onLoginSuccess(); // Use context callback to navigate
      } 
      else if (mode === 'SIGNUP') {
        const user = await firebaseSignup(email, password, name);
        // inside your signup flow, after you have a token:
        const username = email.split('@')[0];// derive username from email
        //role : restaurant_owner or user
        const userPayload = { name, username, email, role};
        const result = await createUser(userPayload);
        // handle success (result contains backend response)
        setMsg("Account created! You are now logged in.");
        onLoginSuccess();  
      } 
      else if (mode === 'FORGOT_PASSWORD') {
        await firebaseResetPassword(email);
        setMsg(`Password reset link sent to ${email}. Please check your spam folder if you do not find it in inbox.`);
        setTimeout(() => setMode('LOGIN'), 5000); // Auto switch back after 3s
      }
    } catch (err: any) {
      const message = err.message || "An error occurred";
      // Friendly error mapping
      if (message.includes("auth/user-not-found") || message.includes("auth/invalid-credential")) {
        setError("Invalid email or password.");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("This email is already registered.");
      } else if (message.includes("auth/weak-password")) {
        setError("Password should be at least 6 characters.");
      } else {
        setError(`Unexpected Error: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
      >
        
        {/* ✅ 2. UPDATED HEADER WITH LOGO */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            {/* Logo Image */}
            <img 
              src="/logo.jpg" 
              alt="Dine Offers" 
              className="w-12 h-12 rounded-full shadow-sm object-cover border border-gray-200" 
            />
            
            {/* Dynamic Title */}
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-gray-800 leading-tight">
                {mode === 'LOGIN' && 'Welcome Back'}
                {mode === 'SIGNUP' && 'Create Account'}
                {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Browse Qatar's best dining offers
              </span>
            </div>
          </div>

          <button 
            onClick={closeLogin} 
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">{error}</div>}
          {msg && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">{msg}</div>}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {mode === 'SIGNUP' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input 
                  required 
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>

            {mode !== 'FORGOT_PASSWORD' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            )}

            {/* Role Selection for Signup */}
            {mode === 'SIGNUP' && (
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
                <div className="relative">
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="user">Foodie (Browse Offers)</option>
                    <option value="restaurant_owner">Restaurant Owner (Post Offers)</option>
                  </select>
                  {/* Custom arrow if needed, but default works */}
                </div>
               </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed mt-2 shadow-md hover:shadow-lg"
            >
              {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : mode === 'SIGNUP' ? 'Create Account' : 'Send Reset Link')}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-2 pt-4 border-t border-gray-100 text-center text-sm text-gray-600 space-y-1">
            {mode === 'LOGIN' && (
              <>
                {ENABLE_SIGNUP && (
                  <p>Don't have an account? <button onClick={() => setMode('SIGNUP')} className="text-blue-600 font-bold hover:underline">Sign up</button></p>
                )}
                {!ENABLE_SIGNUP && (
                  <div>
                    <p className="text-gray-900 text-medium italic">Restaurant owner, Don't have an account? Please <a href="#" className="text-blue-600 font-semibold hover:underline">Register your business</a></p> 
                    <p className="text-gray-900 text-medium italic">For public user, Login account is not required; You may please use Favourites section to keep your favorite offers handy.</p>
                  </div>
                )}
                <button onClick={() => setMode('FORGOT_PASSWORD')} className="text-red-900 hover:text-blue-800 text-s">Forgot Password?</button>
              </>
            )}
            
            {(mode === 'SIGNUP' || mode === 'FORGOT_PASSWORD') && (
              <p>Already have an account? <button onClick={() => setMode('LOGIN')} className="text-blue-600 font-bold hover:underline">Sign In</button></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}