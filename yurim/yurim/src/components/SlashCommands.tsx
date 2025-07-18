import React, { useEffect, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Minus 
} from 'lucide-react';

interface SlashCommandsProps {
  position: { x: number; y: number };
  onSelect: (command: string) => void;
  onClose: () => void;
}

const SlashCommands: React.FC<SlashCommandsProps> = ({ position, onSelect, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const commands = [
    { id: 'heading1', label: '제목 1', icon: Heading1, description: '큰 제목' },
    { id: 'heading2', label: '제목 2', icon: Heading2, description: '중간 제목' },
    { id: 'heading3', label: '제목 3', icon: Heading3, description: '작은 제목' },
    { id: 'bullet', label: '글머리 기호', icon: List, description: '불릿 리스트' },
    { id: 'numbered', label: '번호 매기기', icon: ListOrdered, description: '숫자 리스트' },
    { id: 'quote', label: '인용문', icon: Quote, description: '인용 블록' },
    { id: 'code', label: '코드 블록', icon: Code, description: '코드 입력' },
    { id: 'divider', label: '구분선', icon: Minus, description: '수평선 추가' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={containerRef}
      className="slash-commands"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
      }}
    >
      <div className="slash-commands-header">
        <span className="slash-commands-title">블록 추가</span>
      </div>
      <div className="slash-commands-list">
        {commands.map((command) => {
          const Icon = command.icon;
          return (
            <button
              key={command.id}
              className="slash-command-item"
              onClick={() => onSelect(command.id)}
            >
              <div className="command-icon">
                <Icon size={16} />
              </div>
              <div className="command-content">
                <div className="command-label">{command.label}</div>
                <div className="command-description">{command.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlashCommands;