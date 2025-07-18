import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons';
import { openAIService, ChatMessage } from '../services/openai';
import { Bot, User, AlertCircle, Settings, Loader, Paperclip, FileText, Image, X } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  type: 'sent' | 'received';
  timestamp: Date;
  isStreaming?: boolean;
  attachments?: FileAttachment[];
}

interface FileAttachment {
  name: string;
  type: string;
  content: string;
  size: number;
}

const ChatPanel = () => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: '안녕하세요! AND COMPANY 워크스페이스 AI 어시스턴트입니다. 문서 작성, 일정 관리, 아이디어 정리 등 무엇이든 도와드릴게요! 📎 파일을 업로드하면 내용을 분석해드릴 수 있습니다. 😊', 
      type: 'received',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsConfigured(openAIService.isConfigured());
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB 제한
        alert('파일 크기는 10MB 이하여야 합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const attachment: FileAttachment = {
          name: file.name,
          type: file.type,
          content: content,
          size: file.size
        };
        setAttachments(prev => [...prev, attachment]);
      };

      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file); // 다른 파일도 텍스트로 시도
      }
    });

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    if (!isConfigured) {
      setShowSettings(true);
      return;
    }

    let messageText = message.trim();
    
    // 첨부파일이 있으면 내용을 메시지에 포함
    if (attachments.length > 0) {
      messageText += '\n\n📎 첨부파일:\n';
      attachments.forEach(attachment => {
        messageText += `\n파일명: ${attachment.name}\n`;
        if (attachment.type.startsWith('text/') || attachment.name.endsWith('.txt') || attachment.name.endsWith('.md')) {
          messageText += `내용:\n${attachment.content}\n`;
        } else if (attachment.type.startsWith('image/')) {
          messageText += `이미지 파일 (분석 요청)\n`;
        }
        messageText += '---\n';
      });
    }

    const userMessage: Message = {
      id: Date.now(),
      text: messageText,
      type: 'sent',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setAttachments([]);
    setIsLoading(true);

    // 시스템 프롬프트 추가
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `당신은 AND COMPANY 워크스페이스의 AI 어시스턴트입니다.
      사용자의 문서 작성, 일정 관리, 업무 효율성 향상을 도와주세요. 
      친근하고 전문적인 톤으로 한국어로 답변해주세요.
      현재 워크스페이스에는 문서 편집기, 일정 관리, 즐겨찾기, 휴지통 등의 기능이 있습니다.
      
      사용자가 파일을 업로드하면 해당 내용을 분석하고 요약하거나 질문에 답변해주세요.
      회의록, 문서, 이미지 등 다양한 형태의 파일을 처리할 수 있습니다.`
    };

    const chatMessages: ChatMessage[] = [
      systemMessage,
      ...messages.slice(-10).map(msg => ({
        role: msg.type === 'sent' ? 'user' as const : 'assistant' as const,
        content: msg.text
      })),
      { role: 'user', content: messageText }
    ];

    try {
      // 스트리밍 응답을 위한 빈 메시지 생성
      const assistantMessageId = Date.now() + 1;
      const assistantMessage: Message = {
        id: assistantMessageId,
        text: '',
        type: 'received',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      // 스트리밍으로 응답 받기
      await openAIService.sendMessageStream(chatMessages, (chunk) => {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, text: msg.text + chunk }
            : msg
        ));
      });

      // 스트리밍 완료
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `죄송합니다. 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        type: 'received',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      // 실제로는 환경변수에 저장해야 하지만, 데모용으로 localStorage 사용
      localStorage.setItem('openai_api_key', apiKey.trim());
      // 페이지 새로고침으로 환경변수 재로드 시뮬레이션
      alert('API 키가 저장되었습니다. 페이지를 새로고침해주세요.');
      setShowSettings(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image size={16} />;
    }
    return <FileText size={16} />;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title-section">
          <Bot className="chat-bot-icon" />
          <div>
            <h3 className="chat-title">AI Assistant</h3>
            <div className={`chat-status ${isConfigured ? 'online' : 'offline'}`}>
              {isConfigured ? 'Online' : 'API Key Required'}
            </div>
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
      
      <div className="message-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.type}`}>
            <div className="message-header">
              {msg.type === 'sent' ? (
                <User className="message-avatar" />
              ) : (
                <Bot className="message-avatar" />
              )}
              <span className="message-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">
              {msg.text}
              {msg.isStreaming && (
                <span className="streaming-cursor">▊</span>
              )}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="message-attachments">
                  {msg.attachments.map((attachment, index) => (
                    <div key={index} className="attachment-preview">
                      {getFileIcon(attachment.name, attachment.type)}
                      <span className="attachment-name">{attachment.name}</span>
                      <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble received loading">
            <div className="message-header">
              <Bot className="message-avatar" />
              <span className="message-time">입력 중...</span>
            </div>
            <div className="message-content">
              <Loader className="loading-spinner" />
              AI가 응답을 생성하고 있습니다...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        {!isConfigured && (
          <div className="api-warning">
            <AlertCircle size={16} />
            <span>OpenAI API 키를 설정해주세요</span>
          </div>
        )}
        
        {/* 첨부파일 미리보기 */}
        {attachments.length > 0 && (
          <div className="attachments-preview">
            {attachments.map((attachment, index) => (
              <div key={index} className="attachment-item">
                <div className="attachment-info">
                  {getFileIcon(attachment.name, attachment.type)}
                  <span className="attachment-name">{attachment.name}</span>
                  <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                </div>
                <button
                  className="remove-attachment"
                  onClick={() => removeAttachment(index)}
                  title="첨부파일 제거"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept=".txt,.md,.doc,.docx,.pdf,image/*"
          />
          <button
            type="button"
            className="attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="파일 첨부"
          >
            <Paperclip className="attach-icon" />
          </button>
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={isConfigured ? "메시지를 입력하거나 파일을 첨부하세요... (Shift+Enter로 줄바꿈)" : "API 키를 먼저 설정해주세요"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConfigured || isLoading}
            rows={1}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={(!message.trim() && attachments.length === 0) || !isConfigured || isLoading}
          >
            {isLoading ? (
              <Loader className="send-icon spinning" />
            ) : (
              <SendIcon className="send-icon" />
            )}
          </button>
        </form>
      </div>

      {/* API 키 설정 모달 */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content api-settings-modal">
            <h3 className="modal-title">🔑 OpenAI API 설정</h3>
            <div className="api-settings-content">
              <p className="api-description">
                ChatGPT API를 사용하려면 OpenAI API 키가 필요합니다.
              </p>
              <div className="api-steps">
                <ol>
                  <li><a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API 키 페이지</a>에서 API 키를 생성하세요</li>
                  <li>아래에 API 키를 입력하세요</li>
                  <li>저장 후 채팅을 시작하세요</li>
                </ol>
              </div>
              <div className="api-input-group">
                <label className="api-label">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="api-input"
                />
              </div>
              <div className="api-note">
                <AlertCircle size={16} />
                <span>API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowSettings(false)}
              >
                취소
              </button>
              <button 
                className="confirm-btn"
                onClick={saveApiKey}
                disabled={!apiKey.trim()}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;