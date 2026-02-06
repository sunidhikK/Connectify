import { Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { Users } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-secondary/30">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-semibold">Connectify</span>
      </Link>

      <AuthForm mode="login" />

      <p className="mt-6 text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
