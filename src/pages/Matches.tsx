import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useMatches } from '@/hooks/useMatches';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Users, 
  ArrowLeft,
  Smile,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function Matches() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { matches, isLoading: matchesLoading } = useMatches();
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const { messages, isLoading: messagesLoading, sendMessage, markAsRead } = useMessages(selectedMatchId);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedMatchId) {
      markAsRead();
    }
  }, [selectedMatchId, markAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    setIsSending(true);
    const success = await sendMessage(messageInput);
    if (success) {
      setMessageInput('');
    }
    setIsSending(false);
  };

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  if (authLoading || matchesLoading) {
    return (
      <Layout>
        <div className="container py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Chat
        </h1>

        {matches.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No matches yet</h3>
              <p className="text-muted-foreground">
                Browse projects and express interest to get matched with project owners!
              </p>
              <Button onClick={() => navigate('/browse')}>
                Browse Projects
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
            {/* Matches List */}
            <Card className={cn('lg:col-span-1', selectedMatchId && 'hidden lg:block')}>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-warning" />
                  Conversations ({matches.length})
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="space-y-1 p-4 pt-0">
                  {matches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => setSelectedMatchId(match.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group',
                        selectedMatchId === match.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-secondary border border-transparent'
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                          <AvatarImage src={match.other_user?.avatar_url || undefined} />
                          <AvatarFallback className="gradient-bg text-primary-foreground">
                            {match.other_user?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {match.other_user?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {match.project?.title || 'Project'}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Matched {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className={cn('lg:col-span-2 flex flex-col', !selectedMatchId && 'hidden lg:flex')}>
              {selectedMatch ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="py-3 border-b bg-secondary/30">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSelectedMatchId(null)}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                        <AvatarImage src={selectedMatch.other_user?.avatar_url || undefined} />
                        <AvatarFallback className="gradient-bg text-primary-foreground">
                          {selectedMatch.other_user?.full_name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {selectedMatch.other_user?.full_name || 'Unknown'}
                          <Link 
                            to={`/profile/${selectedMatch.user_id === user?.id ? selectedMatch.owner_id : selectedMatch.user_id}`}
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {selectedMatch.project?.title}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary mx-auto mb-4">
                          <Smile className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">Start the conversation!</h3>
                        <p className="text-sm">
                          Say hello to your new teammate
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                          <div key={date}>
                            {/* Date separator */}
                            <div className="flex items-center gap-3 my-4">
                              <div className="flex-1 h-px bg-border" />
                              <span className="text-xs text-muted-foreground px-2 bg-background">
                                {date === new Date().toLocaleDateString() ? 'Today' : date}
                              </span>
                              <div className="flex-1 h-px bg-border" />
                            </div>
                            
                            {/* Messages for this day */}
                            <div className="space-y-3">
                              {dayMessages.map((message) => {
                                const isOwn = message.sender_id === user?.id;
                                return (
                                  <div
                                    key={message.id}
                                    className={cn(
                                      'flex',
                                      isOwn ? 'justify-end' : 'justify-start'
                                    )}
                                  >
                                    <div className={cn(
                                      'flex items-end gap-2 max-w-[80%]',
                                      isOwn && 'flex-row-reverse'
                                    )}>
                                      {!isOwn && (
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={selectedMatch.other_user?.avatar_url || undefined} />
                                          <AvatarFallback className="text-[10px]">
                                            {selectedMatch.other_user?.full_name?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      <div
                                        className={cn(
                                          'rounded-2xl px-4 py-2.5 shadow-sm',
                                          isOwn
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-secondary rounded-bl-md'
                                        )}
                                      >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        <p className={cn(
                                          'text-[10px] mt-1',
                                          isOwn
                                            ? 'text-primary-foreground/70'
                                            : 'text-muted-foreground'
                                        )}>
                                          {new Date(message.created_at).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t bg-secondary/20">
                    <div className="flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-background"
                        disabled={isSending}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        disabled={!messageInput.trim() || isSending}
                        className="shrink-0"
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
