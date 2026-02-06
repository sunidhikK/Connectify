import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

const skillSuggestions = [
  'React', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'C++',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Vue.js', 'Angular', 'Next.js', 'Django',
  'Flask', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'GCP', 'Azure', 'TensorFlow', 'PyTorch', 'Figma', 'UI/UX'
];

export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const { login, signup, isLoading, isAuthenticated } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    skills: [] as string[],
    availability: '' as 'full-time' | 'part-time' | 'weekends' | 'flexible' | '',
    lookingFor: '' as 'project' | 'teammates' | 'both' | '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [step, setStep] = useState(1);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/browse');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'login') {
      const result = await login(formData.email, formData.password);
      if (!result.error) {
        navigate('/browse');
      }
    } else {
      if (step === 1) {
        setStep(2);
        return;
      }
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        skills: formData.skills,
        availability: formData.availability || 'flexible',
        lookingFor: formData.lookingFor || 'both',
      });
      if (!result.error) {
        navigate('/browse');
      }
    }
  }, [mode, step, formData, login, signup, navigate]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const filteredSuggestions = skillSuggestions.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !formData.skills.includes(s)
  );

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-card">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold">
          {mode === 'login' ? 'Welcome back' : step === 1 ? 'Create your account' : 'Tell us about yourself'}
        </CardTitle>
        <CardDescription>
          {mode === 'login'
            ? 'Sign in to find your next project or teammate'
            : step === 1
            ? 'Join Connectify and start collaborating'
            : 'Help us match you with the right projects'}
        </CardDescription>
        {mode === 'signup' && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className={cn('h-2 w-8 rounded-full transition-colors', step >= 1 ? 'bg-primary' : 'bg-muted')} />
            <div className={cn('h-2 w-8 rounded-full transition-colors', step >= 2 ? 'bg-primary' : 'bg-muted')} />
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Your Skills</Label>
                <div className="relative">
                  <Input
                    placeholder="Type a skill and press Enter"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill(skillInput);
                      }
                    }}
                  />
                  {skillInput && filteredSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                      {filteredSuggestions.slice(0, 5).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary transition-colors"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value as typeof formData.availability }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="weekends">Weekends only</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What are you looking for?</Label>
                <Select
                  value={formData.lookingFor}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, lookingFor: value as typeof formData.lookingFor }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">A project to join</SelectItem>
                    <SelectItem value="teammates">Teammates for my project</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {mode === 'signup' && step === 2 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Sign in' : step === 1 ? 'Continue' : 'Create account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
