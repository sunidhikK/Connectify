import { Link } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { Users } from 'lucide-react';

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-gradient-to-br from-background via-background to-secondary/30">
      <Link to="/" className="flex items-center gap-2 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <Users className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-2xl font-semibold">Connectify</span>
      </Link>

      {/* Sign in link at top - visible without scrolling */}
      <p className="mb-6 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>

      <AuthForm mode="signup" />
    </div>
  );
}
