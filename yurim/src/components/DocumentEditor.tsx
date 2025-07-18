import React, { useState, useRef, useEffect } from 'react';
import { Star, Lock } from 'lucide-react';
import { Document } from '../types/document';
import SlashCommands from './SlashCommands';

interface DocumentEditorProps {
  document: Document;
  onUpdate: (doc: Document) => void;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, onUpdate }) => {
  const [title, setTitle] = useState(document.title);
  const [content, setContent] = useState(document.content);
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // 문서 변경 시 상태 업데이트
  useEffect(() => {
    setTitle(document.title);
    setContent(document.content);
  }, [document]);

  // 자동 저장
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== document.title || content !== document.content) {
        onUpdate({
          ...document,
          title: title || 'Untitled',
          content,
          updatedAt: new Date(),
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [title, content, document, onUpdate]);

  // 슬래시 명령어 감지
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    setContent(value);
    setCursorPosition(cursorPos);

    // 슬래시 명령어 감지
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.substring(lastSlashIndex + 1);
      const isAtLineStart = lastSlashIndex === 0 || textBeforeCursor[lastSlashIndex - 1] === '\n';
      
      if (isAtLineStart && !textAfterSlash.includes(' ') && !textAfterSlash.includes('\n')) {
        // 슬래시 명령어 위치 계산
        const textarea = e.target;
        const rect = textarea.getBoundingClientRect();
        const lineHeight = 24; // 대략적인 라인 높이
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        
        setSlashPosition({
          x: rect.left + 20,
          y: rect.top + (currentLine * lineHeight) + 30,
        });
        setShowSlashCommands(true);
        return;
      }
    }
    
    setShowSlashCommands(false);
  };

  // 슬래시 명령어 선택
  const handleSlashCommand = (command: string) => {
    const textBeforeCursor = content.substring(0, cursorPosition);
    const textAfterCursor = content.substring(cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/');
    
    const beforeSlash = content.substring(0, lastSlashIndex);
    let newContent = '';
    
    switch (command) {
      case 'heading1':
        newContent = beforeSlash + '# ';
        break;
      case 'heading2':
        newContent = beforeSlash + '## ';
        break;
      case 'heading3':
        newContent = beforeSlash + '### ';
        break;
      case 'bullet':
        newContent = beforeSlash + '- ';
        break;
      case 'numbered':
        newContent = beforeSlash + '1. ';
        break;
      case 'quote':
        newContent = beforeSlash + '> ';
        break;
      case 'code':
        newContent = beforeSlash + '```\n\n```';
        break;
      case 'divider':
        newContent = beforeSlash + '---\n';
        break;
      default:
        newContent = beforeSlash;
    }
    
    setContent(newContent + textAfterCursor);
    setShowSlashCommands(false);
    
    // 커서 위치 조정
    setTimeout(() => {
      if (contentRef.current) {
        const newCursorPos = newContent.length;
        contentRef.current.setSelectionRange(newCursorPos, newCursorPos);
        contentRef.current.focus();
      }
    }, 0);
  };

  // 키보드 단축키
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSlashCommands(false);
    }
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertMarkdown('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertMarkdown('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertMarkdown('[', '](url)');
          break;
      }
    }
  };

  // 마크다운 삽입
  const insertMarkdown = (before: string, after: string) => {
    if (!contentRef.current) return;
    
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      if (contentRef.current) {
        const newCursorPos = start + before.length + selectedText.length;
        contentRef.current.setSelectionRange(newCursorPos, newCursorPos);
        contentRef.current.focus();
      }
    }, 0);
  };

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    onUpdate({
      ...document,
      isFavorite: !document.isFavorite,
      updatedAt: new Date(),
    });
  };

  // 비밀번호 보호 토글
  const togglePasswordProtection = () => {
    if (document.isPasswordProtected) {
      // 비밀번호 보호 해제
      onUpdate({
        ...document,
        isPasswordProtected: false,
        password: undefined,
        updatedAt: new Date(),
      });
    } else {
      // 비밀번호 보호 설정
      const password = prompt('문서에 설정할 비밀번호를 입력하세요:');
      if (password) {
        onUpdate({
          ...document,
          isPasswordProtected: true,
          password: password,
          updatedAt: new Date(),
        });
      }
    }
  };

  return (
    <div className="document-editor">
      <div className="document-editor-header">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="페이지 제목을 입력하세요..."
          className="document-title-input"
        />
        <div className="editor-controls">
          <button 
            className={`control-btn favorite-btn ${document.isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            title={document.isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
          >
            <Star size={18} />
          </button>
          <button 
            className={`control-btn password-btn ${document.isPasswordProtected ? 'active' : ''}`}
            onClick={togglePasswordProtection}
            title={document.isPasswordProtected ? '비밀번호 보호 해제' : '비밀번호 보호 설정'}
          >
            <Lock size={18} />
          </button>
        </div>
      </div>

      <div className="document-editor-content">
        <div className="editor-container">
          <textarea
            ref={contentRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="내용을 입력하세요... ('/' 를 입력하면 명령어를 볼 수 있습니다)"
            className="content-textarea"
          />
          
          {showSlashCommands && (
            <SlashCommands
              position={slashPosition}
              onSelect={handleSlashCommand}
              onClose={() => setShowSlashCommands(false)}
            />
          )}
        </div>
      </div>

      <div className="editor-help">
        <p className="help-text">
          💡 <strong>단축키:</strong> Ctrl+B (굵게), Ctrl+I (기울임), Ctrl+K (링크), / (명령어)
        </p>
      </div>
    </div>
  );
};

export default DocumentEditor;