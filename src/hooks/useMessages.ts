import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export function useMessages(matchId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchMessages = useCallback(async () => {
    if (!matchId || !user) {
      setMessages([]);
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setIsLoading(false);
  }, [matchId, user]);

  useEffect(() => {
    fetchMessages();

    if (!matchId) return;

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, fetchMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!matchId || !user || !content.trim()) return false;

    const { error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending message:', error);
      return false;
    }

    return true;
  }, [matchId, user]);

  const markAsRead = useCallback(async () => {
    if (!matchId || !user) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('sender_id', user.id)
      .eq('read', false);
  }, [matchId, user]);

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    fetchMessages,
  };
}
