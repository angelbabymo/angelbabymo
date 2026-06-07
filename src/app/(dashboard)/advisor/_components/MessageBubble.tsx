import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'video_analysis';
  video_url?: string;
}

export default function MessageBubble({
  message,
  isStreaming,
}: {
  message: Message;
  isStreaming?: boolean;
}) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 flex-shrink-0 mt-1"
          style={{ background: 'var(--surface-2)' }}
        >
          DV
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
          isUser ? 'rounded-br-md' : 'rounded-bl-md'
        }`}
        style={
          isUser
            ? { background: 'var(--text)', color: 'var(--bg)' }
            : { background: 'var(--surface-2)', color: 'var(--text)' }
        }
      >
        {message.video_url && !isUser && (
          <div className="text-xs mb-2 opacity-50">
            📹 {message.video_url}
          </div>
        )}
        <div className="prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        {isStreaming && (
          <span
            className="inline-block w-1.5 h-4 animate-pulse ml-0.5 align-middle"
            style={{ background: 'var(--text-3)' }}
          />
        )}
      </div>
    </div>
  );
}
