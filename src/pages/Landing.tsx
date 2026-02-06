import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Users, 
  Layers, 
  MessageSquare, 
  Sparkles, 
  CheckCircle,
  Zap,
  Award,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Layers,
    title: 'Discover Projects',
    description: 'Browse curated project cards from hackathon teams and indie developers seeking collaborators.',
    gradient: 'from-primary to-accent',
  },
  {
    icon: Users,
    title: 'Find Your Team',
    description: 'Match with project owners based on your skills, availability, and interests.',
    gradient: 'from-accent to-warning',
  },
  {
    icon: MessageSquare,
    title: 'Connect & Build',
    description: 'Once matched, start chatting and build something amazing together.',
    gradient: 'from-warning to-success',
  },
];

const stats = [
  { value: '2,500+', label: 'Active Projects', icon: Layers },
  { value: '15,000+', label: 'Developers', icon: Users },
  { value: '8,000+', label: 'Successful Matches', icon: Star },
];

const perks = [
  { icon: Award, text: 'Skill Badges & Endorsements' },
  { icon: TrendingUp, text: 'Activity Tracking' },
  { icon: Zap, text: 'Real-time Messaging' },
  { icon: Sparkles, text: 'Portfolio Showcase' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-30">
            <div className="absolute inset-0 border border-primary/20 rounded-full animate-spin-slow" />
            <div className="absolute inset-8 border border-accent/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            <div className="absolute inset-16 border border-warning/20 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }} />
          </div>
        </div>

        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 animate-bounce-subtle">
              <Badge className="px-4 py-1.5 text-sm gradient-bg border-0 text-primary-foreground">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                The #1 platform for Gen-Z collaboration
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Find Your Perfect
              <span className="block gradient-text py-2">Project Match</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connectify brings together developers, designers, and innovators. 
              Swipe through projects, connect with teams, and build something <span className="text-foreground font-medium">extraordinary</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Button size="lg" className="gap-2 text-base px-8 h-14 gradient-bg hover:opacity-90 transition-opacity" asChild>
                  <Link to="/browse">
                    Browse Projects
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="gap-2 text-base px-8 h-14 gradient-bg hover:opacity-90 transition-opacity glow" asChild>
                    <Link to="/signup">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base px-8 h-14 hover-lift" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Perks Row */}
            <div className="flex flex-wrap justify-center gap-4 pt-6">
              {perks.map((perk) => (
                <div key={perk.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <perk.icon className="h-4 w-4 text-primary" />
                  {perk.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-secondary/20">
        <div className="container">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Three steps to your
              <span className="gradient-text"> dream team</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, intuitive, and designed for collaboration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="relative overflow-hidden border-0 shadow-xl hover-lift animate-slide-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Gradient top border */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
                
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-bold">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <Card className="relative overflow-hidden border-0 shadow-2xl">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-warning opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.4),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent)/0.4),transparent_50%)]" />
            
            <CardContent className="relative p-10 md:p-16 text-center space-y-8 text-white">
              <h2 className="text-3xl md:text-5xl font-bold">Ready to Start Building?</h2>
              <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">
                Join thousands of developers and designers who are already connecting and collaborating on amazing projects.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Free to join</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Start matching instantly</span>
                </div>
              </div>
              <Button 
                size="lg" 
                className="mt-6 gap-2 h-14 px-10 text-lg bg-white text-primary hover:bg-white/90 shadow-xl" 
                asChild
              >
                <Link to={isAuthenticated ? '/browse' : '/signup'}>
                  {isAuthenticated ? 'Browse Projects' : 'Create Your Profile'}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Connectify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Connectify. Built for Gen-Z builders.
          </p>
        </div>
      </footer>
    </Layout>
  );
}
