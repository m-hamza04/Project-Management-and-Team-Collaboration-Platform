import { useState, FormEvent } from 'react';
import { useNavigate, Link } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { getErrorMessage } from '@/api/getErrorMessage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      showToast(`Welcome back, ${data.user.name.split(' ')[0]}`);
      navigate({ to: '/dashboard' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-base)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)] font-[var(--font-display)] text-2xl font-bold text-[var(--color-accent-text)]">
            F
          </div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Sign in to keep your projects moving.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && (
            <p className="rounded-lg bg-[rgba(224,112,92,0.1)] px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={mutation.isPending} className="mt-2 w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          New team member?{' '}
          <Link to="/register" className="text-[var(--color-accent)] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
