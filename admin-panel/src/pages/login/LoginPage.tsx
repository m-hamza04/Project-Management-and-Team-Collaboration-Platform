import { useState, FormEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuth } from '@/auth/AuthContext';
import { getErrorMessage } from '@/api/getErrorMessage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      // This panel is Admin-only — reject any other role at the door,
      // even though the credentials themselves were valid.
      if (data.user.role !== 'ADMIN') {
        setError('This console is restricted to Administrator accounts.');
        return;
      }
      login(data.user, data.token);
      navigate({ to: '/dashboard' });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Enter your email and password.');
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-base)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent)] text-[var(--color-accent-text)]">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Admin Console</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Restricted access — Administrator accounts only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="admin@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </div>
  );
}
