import React from 'react';
import useAuth from '../auth/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (auth.provider === 'FIREBASE') {
        await auth.loginWithEmail?.(email, password);
        navigate(next);
      } else {
        // For Keycloak, trigger normal login redirect
        const redirect = window.location.origin + next;
        auth.login?.({ redirectUri: redirect } as any);
        // Keycloak will redirect - navigation back happens after redirect
      }
    } catch (err: any) {
      // Map common Firebase/auth errors to friendly messages
      const code = err?.code || err?.message || '';
      if (typeof code === 'string' && code.includes('auth/')) {
        setError('Username or password is incorrect... Please try again');
      } else if (typeof code === 'string' && code.toLowerCase().includes('invalid-email')) {
        setError('Please enter a valid email address');
      } else {
        setError(err?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // If user becomes authenticated (e.g., Keycloak redirect or Firebase), redirect to next
  React.useEffect(() => {
    if (auth.initialized && auth.user) {
      // eslint-disable-next-line no-console
      console.log('Authenticated - redirecting to', next);
      navigate(next);
    }
  }, [auth.initialized, auth.user, navigate, next]);

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex items-center gap-3">
          <img src={'/bqLogo.jpg'} alt="Dine Deals" className="w-12 h-12 rounded shadow" />
          <div>
            <div className="text-xl font-extrabold text-purple-600">Dine Deals</div>
            <div className="text-sm text-gray-500">Discover the best local offers</div>
          </div>
        </div>
      </div>
      {auth.provider === 'FIREBASE' ? (
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-3 py-2" />
          </div>
          {error && <div className="text-red-600">{error}</div>}
          <button disabled={loading} className="px-4 py-2 bg-blue-600 text-white w-full">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      ) : (
        <div>
          <p>Click the button to sign in to your account.</p>
          <button className="px-4 py-2 bg-blue-600 text-white w-full" onClick={() => auth.login()}>
            Sign in with Keycloak
          </button>
        </div>
      )}
      <footer className="bg-muted py-4 px-4 mt-2">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-3">
            {/* <p className="m-0">© 2025 BrowseQatar Offers Platform. All rights reserved.</p>
            <span className="text-muted-foreground">|</span> */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <img src={'/meraki.webp'} alt="Meraki AI" className="w-6 h-6 object-contain" />
              <span>Powered by MerakiAi</span>
            </div>
          </div>
        </div>
      </footer>
      </div>
  );
}
