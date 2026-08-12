import { useState, useEffect, useRef, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, MessageCircle } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { messagesApi } from '@/api/messages';
import { useAppSelector } from '@/app/hooks';
import { getSocket } from '@/lib/socket';
import { ChatMessage } from '@/types/chat';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/States';
import { clsx } from 'clsx';

export function ChatPage() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const [projectId, setProjectId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  // Default to the first project once the list loads
  useEffect(() => {
    if (!projectId && projects.length > 0) setProjectId(projects[0].id);
  }, [projects, projectId]);

  // Load history whenever the selected project changes
  useEffect(() => {
    if (!projectId) return;
    messagesApi.getByProject(projectId).then(setMessages);
  }, [projectId]);

  // Join the project's live room and listen for new messages
  useEffect(() => {
    if (!projectId || !token) return;

    const socket = getSocket(token);
    socket.emit('join-project', projectId);

    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    };
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.emit('leave-project', projectId);
      socket.off('new-message', handleNewMessage);
    };
  }, [projectId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !token || !projectId) return;
    const socket = getSocket(token);
    socket.emit('send-message', { projectId, content: draft.trim() });
    setDraft('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Messages</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Live chat with your project team.
          </p>
        </div>
        <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {!projectId ? (
        <EmptyState
          icon={MessageCircle}
          title="No projects to chat in"
          description="Once you're part of a project, its chat room will show up here."
        />
      ) : (
        <div className="flex flex-1 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
            {messages.length === 0 ? (
              <p className="m-auto text-sm text-[var(--color-text-faint)]">
                No messages yet — say hello to the team.
              </p>
            ) : (
              messages.map((m) => {
                const isMine = m.author.id === user?.id;
                return (
                  <div
                    key={m.id}
                    className={clsx('flex flex-col max-w-[70%]', isMine ? 'self-end items-end' : 'self-start items-start')}
                  >
                    {!isMine && (
                      <span className="mb-1 text-xs font-medium text-[var(--color-text-muted)]">
                        {m.author.name}
                      </span>
                    )}
                    <div
                      className={clsx(
                        'rounded-2xl px-4 py-2.5 text-sm',
                        isMine
                          ? 'bg-[var(--color-accent)] text-[var(--color-accent-text)] rounded-br-sm'
                          : 'bg-black/[0.04] text-[var(--color-text)] rounded-bl-sm'
                      )}
                    >
                      {m.content}
                    </div>
                    <span className="mt-1 text-[10px] text-[var(--color-text-faint)]">
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-[var(--color-border)] p-4"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl bg-[var(--color-base)] border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-accent-text)] transition-opacity disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
