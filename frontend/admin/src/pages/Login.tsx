import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logo from '@/assets/logo.jpeg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&])[A-Za-z\d@#$!%*?&]{8,}$/;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [attempts, setAttempts] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  if (isAuthenticated) { navigate('/dashboard', { replace: true }); return null; }

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return 'Email is required';
    if (!EMAIL_REGEX.test(value)) return 'Invalid email address';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value.trim()) return 'Password is required';
    if (!PASSWORD_REGEX.test(value)) return 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@#$!%*?&)';
    return undefined;
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    setErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    setErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr || passwordErr) {
      setErrors({ email: emailErr, password: passwordErr });
      return;
    }

    if (attempts >= 5) {
      setErrors({ general: 'Too many failed attempts. Please try again later.' });
      return;
    }

    if (login(email, password)) {
      navigate('/dashboard');
    } else {
      setAttempts(prev => prev + 1);
      setPassword('');
      setErrors({ general: 'Invalid email or password' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="Somerville Mobile" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="text-center">
            <h1 className="text-2xl font-bold">Somerville Mobile</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {errors.general && <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{errors.general}</div>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(e.target.value) }));
              }}
              onBlur={handleEmailBlur}
              placeholder="Enter your email"
              // autoComplete="off"
            />
            {touched.email && errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (touched.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }));
                }}
                onBlur={handlePasswordBlur}
                placeholder="Enter your password"
                autoComplete="one-time-code"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {touched.password && errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={attempts >= 5}>Sign In</Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
