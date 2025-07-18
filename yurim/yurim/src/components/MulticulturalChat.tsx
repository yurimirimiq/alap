import React, { useState, useRef, useEffect } from 'react';
import { Send, Globe, Brain, X, Settings } from 'lucide-react';
import { openAIService, ChatMessage } from '../services/openai';
import './MulticulturalChat.css';

interface Message {
  id: number;
  text: string;
  type: 'sent' | 'received';
  timestamp: Date;
  user: {
    name: string;
    country: string;
    flag: string;
    timezone: 'day' | 'night';
    avatar: string;
  };
  hasTranslation?: boolean;
}

interface TranslationBubble {
  messageId: number;
  text: string;
}

interface FeedbackBubble {
  text: string;
}

interface MulticulturalChatProps {
  documentId?: string;
  documentTitle?: string;
  isCollapsed?: boolean;
}

const MulticulturalChat: React.FC<MulticulturalChatProps> = ({ 
  documentId = 'default',
  documentTitle = 'Document',
  isCollapsed = false
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [translationBubble, setTranslationBubble] = useState<TranslationBubble | null>(null);
  const [feedbackBubble, setFeedbackBubble] = useState<FeedbackBubble | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 문서별 초기 메시지 데이터
  const getInitialMessages = (docId: string): Message[] => {
    const messageTemplates = {
      'quarterly-plan': [
        {
          id: 1,
          text: "Hey team! I've updated the quarterly plan. That new marketing strategy is a real no-brainer!",
          type: 'received' as const,
          timestamp: new Date(Date.now() - 300000),
          user: {
            name: 'Bob',
            country: 'US',
            flag: '🇺🇸',
            timezone: 'day' as const,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          hasTranslation: true
        },
        {
          id: 2,
          text: "Thanks for the update! The numbers look promising. Should we schedule a follow-up meeting?",
          type: 'received' as const,
          timestamp: new Date(Date.now() - 240000),
          user: {
            name: 'Yuki',
            country: 'JP',
            flag: '🇯🇵',
            timezone: 'night' as const,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          hasTranslation: true
        }
      ],
      'budget-review': [
        {
          id: 1,
          text: "I've reviewed the budget proposal. The allocation for R&D looks solid, but we might want to bump up the marketing budget.",
          type: 'received' as const,
          timestamp: new Date(Date.now() - 180000),
          user: {
            name: 'Sarah',
            country: 'CA',
            flag: '🇨🇦',
            timezone: 'day' as const,
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          },
          hasTranslation: true
        }
      ],
      'project-timeline': [
        {
          id: 1,
          text: "The timeline looks ambitious but doable. We'll need to keep a close eye on the milestones.",
          type: 'received' as const,
          timestamp: new Date(Date.now() - 120000),
          user: {
            name: 'Hans',
            country: 'DE',
            flag: '🇩🇪',
            timezone: 'day' as const,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          hasTranslation: true
        }
      ]
    };

    return messageTemplates[docId as keyof typeof messageTemplates] || [
      {
        id: 1,
        text: "That idea is a real no-brainer!",
        type: 'received' as const,
        timestamp: new Date(Date.now() - 300000),
        user: {
          name: 'Bob',
          country: 'US',
          flag: '🇺🇸',
          timezone: 'day' as const,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        },
        hasTranslation: true
      }
    ];
  };

  // 문서별 메시지 로드
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat-messages-${documentId}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    } else {
      const initialMessages = getInitialMessages(documentId);
      setMessages(initialMessages);
      if (initialMessages.length > 0) {
        localStorage.setItem(`chat-messages-${documentId}`, JSON.stringify(initialMessages));
      }
    }
  }, [documentId]);

  // 메시지 저장
  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem(`chat-messages-${documentId}`, JSON.stringify(newMessages));
  };

  useEffect(() => {
    setIsConfigured(openAIService.isConfigured());
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 문화적 번역 요청
  const handleTranslation = async (messageId: number, text: string) => {
    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      const translationPrompt: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a cultural communication assistant helping Korean users understand English messages from international colleagues.

When given an English sentence, your task is to:
1. Identify any idioms, slang, metaphors, or culturally specific phrases.
2. Briefly explain their literal meaning only if helpful.
3. Provide a clear and concise explanation of what this means in the speaker's cultural/business context (e.g., agreement, strong support, urgency, politeness).
4. Suggest a natural Korean equivalent or paraphrased version that reflects the intended nuance, not just literal meaning.
5. Use a friendly and business-appropriate tone.
6. Keep the output short (2~3 sentences max).

Respond only in Korean.`
        },
        {
          role: 'user',
          content: `Message: "${text}"`
        }
      ];

      const response = await openAIService.sendMessage(translationPrompt);
      setTranslationBubble({ messageId, text: response });
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationBubble({ 
        messageId, 
        text: '번역 서비스에 일시적인 문제가 발생했습니다.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 문화적 피드백 요청
  const handleCulturalFeedback = async () => {
    if (!message.trim() || !isConfigured) {
      if (!isConfigured) setShowSettings(true);
      return;
    }

    setIsLoading(true);
    try {
      const feedbackPrompt: ChatMessage[] = [
        {
          role: 'system',
          content: `당신은 국제 비즈니스 커뮤니케이션 전문가입니다. 한국어 메시지를 분석해서 다문화 팀 환경에서 더 효과적이고 적절한 소통을 위한 따뜻하고 지지적인 피드백을 제공해주세요. 비판적이지 않고 건설적인 톤으로 조언해주세요.`
        },
        {
          role: 'user',
          content: `다음 메시지의 문화적 적절성과 톤을 분석하고 개선 제안을 해주세요: "${message}"`
        }
      ];

      const response = await openAIService.sendMessage(feedbackPrompt);
      setFeedbackBubble({ text: response });
    } catch (error) {
      console.error('Feedback error:', error);
      setFeedbackBubble({ 
        text: '피드백 서비스에 일시적인 문제가 발생했습니다.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 전송
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      type: 'sent',
      timestamp: new Date(),
      user: {
        name: '나',
        country: 'KR',
        flag: '🇰🇷',
        timezone: 'day',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
      }
    };

    const newMessages = [...messages, newMessage];
    saveMessages(newMessages);
    setMessage('');
    setFeedbackBubble(null);
  };

  const formatTime = (date: Date) => {
    // 현재 시간을 한국 시간으로 표시
    return new Date().toLocaleTimeString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getTimeIcon = (timezone: 'day' | 'night') => {
    return timezone === 'day' ? '☀️' : '🌙';
  };

  return (
    <div className={`multicultural-chat ${isCollapsed ? 'collapsed' : ''}`}>
      {/* 채팅 헤더 */}
      {!isCollapsed && (
        <div className="chat-header">
        <div className="document-info">
          <div className="document-title">
            🇰🇷🇺🇸🇯🇵🇫🇷
          </div>
          <div className="participants">
            <span className="participant-flags">🇰🇷🇺🇸🇯🇵🇫🇷</span>
          </div>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="설정"
        >
          <Settings size={18} />
        </button>
      </div>
      )}

      {/* 메시지 목록 */}
      {!isCollapsed && (
        <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-container ${msg.type}`}>
            {msg.type === 'received' && (
              <div className="message-header">
                <div className="user-profile">
                  <div className="profile-avatar">
                    <img src={msg.user.avatar} alt={msg.user.name} />
                    <span className="profile-flag">{getTimeIcon(msg.user.timezone)}</span>
                  </div>
                </div>
                <span className="user-info">
                  {msg.user.name} US
                </span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            )}
            
            <div className={`message-bubble ${msg.type}`}>
              <div className="message-content">
                {msg.text}
                {msg.type === 'received' && msg.hasTranslation && (
                  <button
                    className="translation-btn"
                    onClick={() => handleTranslation(msg.id, msg.text)}
                    title="문화적 번역"
                    disabled={isLoading}
                  >
                    <Globe size={14} />
                  </button>
                )}
              </div>
              
              {/* 번역 버블 */}
              {translationBubble && translationBubble.messageId === msg.id && (
                <div className="translation-bubble">
                  <button 
                    className="close-btn"
                    onClick={() => setTranslationBubble(null)}
                  >
                    <X size={12} />
                  </button>
                  <div className="bubble-content">
                    {translationBubble.text}
                  </div>
                </div>
              )}
            </div>

            {msg.type === 'sent' && (
              <div className="message-time sent-time">{formatTime(msg.timestamp)}</div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <span>처리 중...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      )}

      {/* 피드백 버블 */}
      {feedbackBubble && (
        <div className="feedback-bubble">
          <button 
            className="close-btn"
            onClick={() => setFeedbackBubble(null)}
          >
            <X size={12} />
          </button>
          <div className="bubble-content">
            <strong>💡 문화적 피드백:</strong><br />
            {feedbackBubble.text}
          </div>
        </div>
      )}

      {/* 메시지 입력 */}
      {!isCollapsed && (
        <div className="message-input-area">
        {!isConfigured && (
          <div className="api-warning">
            <span>⚠️ OpenAI API 키를 설정해주세요</span>
          </div>
        )}
        
        <form className="message-input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <textarea
              ref={textareaRef}
              className="message-input"
              placeholder="메시지를 입력하세요..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={!isConfigured}
              rows={1}
            />
            <div className="input-actions">
              <button
                type="button"
                className="feedback-btn"
                onClick={handleCulturalFeedback}
                disabled={!message.trim() || !isConfigured || isLoading}
                title="문화적 피드백"
              >
                <Brain size={16} />
              </button>
              <button 
                type="submit" 
                className="send-btn"
                disabled={!message.trim() || !isConfigured}
                title="메시지 전송"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
      )}

      {/* API 설정 모달 */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">🔑 OpenAI API 설정</h3>
            <div className="api-settings-content">
              <p>GPT API를 사용하여 문화적 번역과 피드백을 제공합니다.</p>
              <div className="api-steps">
                <ol>
                  <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API 키 페이지</a>에서 API 키를 생성하세요</li>
                  <li>.env 파일에 VITE_OPENAI_API_KEY를 설정하세요</li>
                  <li>페이지를 새로고침하세요</li>
                </ol>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="confirm-btn"
                onClick={() => setShowSettings(false)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MulticulturalChat;