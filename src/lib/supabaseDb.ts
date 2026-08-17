import { supabase } from './supabase';
import { ChatConversation, ChatMessage, Persona } from '../types/chat';

/**
 * Fetch all conversations for the authenticated user from Supabase.
 */
export async function fetchUserConversations(userId: string): Promise<ChatConversation[]> {
  try {
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (convError) {
      console.warn('Error fetching conversations from Supabase:', convError.message);
      return [];
    }

    if (!convData || convData.length === 0) {
      return [];
    }

    // Fetch messages for these conversations
    const convIds = convData.map((c) => c.id);
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.warn('Error fetching messages from Supabase:', msgError.message);
    }

    const messagesByConv: Record<string, ChatMessage[]> = {};
    (msgData || []).forEach((m) => {
      if (!messagesByConv[m.conversation_id]) {
        messagesByConv[m.conversation_id] = [];
      }
      messagesByConv[m.conversation_id].push({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content || '',
        timestamp: new Date(m.created_at).getTime(),
        groundingSources: m.grounding_sources || [],
        status: 'complete',
      });
    });

    return convData.map((c) => ({
      id: c.id,
      title: c.title || 'Conversation',
      createdAt: new Date(c.created_at).getTime(),
      updatedAt: new Date(c.updated_at).getTime(),
      personaId: c.persona_id || 'general',
      model: c.model || 'claude-5.0',
      enableSearchGrounding: Boolean(c.enable_search_grounding),
      isPinned: Boolean(c.is_pinned),
      messages: messagesByConv[c.id] || [],
    }));
  } catch (err) {
    console.warn('Failed to load conversations from Supabase DB', err);
    return [];
  }
}

/**
 * Save or update a conversation in Supabase DB
 */
export async function upsertConversationDb(chat: ChatConversation, userId?: string | null) {
  if (!userId) return;

  try {
    const { error } = await supabase.from('conversations').upsert(
      {
        id: chat.id.startsWith('chat_') ? undefined : chat.id, // Let UUID or text work
        user_id: userId,
        title: chat.title,
        model: chat.model,
        persona_id: chat.personaId,
        is_pinned: Boolean(chat.isPinned),
        enable_search_grounding: Boolean(chat.enableSearchGrounding),
        updated_at: new Date(chat.updatedAt || Date.now()).toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Failed to upsert conversation to DB:', error.message);
    }
  } catch (e) {
    console.warn('DB upsert error:', e);
  }
}

/**
 * Save a message in Supabase DB
 */
export async function saveMessageDb(
  conversationId: string,
  message: ChatMessage,
  userId?: string | null,
  model?: string
) {
  if (!userId) return;

  try {
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: userId,
      role: message.role,
      content: message.content,
      model: model || null,
      grounding_sources: message.groundingSources || [],
      created_at: new Date(message.timestamp || Date.now()).toISOString(),
    });

    if (error) {
      console.warn('Failed to save message to DB:', error.message);
    }
  } catch (e) {
    console.warn('DB message insert error:', e);
  }
}

/**
 * Delete a conversation from Supabase DB
 */
export async function deleteConversationDb(conversationId: string, userId?: string | null) {
  if (!userId) return;

  try {
    await supabase.from('conversations').delete().eq('id', conversationId).eq('user_id', userId);
  } catch (e) {
    console.warn('DB delete error:', e);
  }
}

/**
 * Clear all conversations for user in Supabase DB
 */
export async function clearAllConversationsDb(userId?: string | null) {
  if (!userId) return;

  try {
    await supabase.from('conversations').delete().eq('user_id', userId);
  } catch (e) {
    console.warn('DB clear error:', e);
  }
}
