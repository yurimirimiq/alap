import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, SliceIcon as InvoiceIcon, SettingsIcon, ArrowLeft, Plus, Search, FileText, Trash2, Calendar, BarChart3, Star, Lock } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Document } from '../types/document';

interface SidebarProps {
  onCreateNew?: () => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  documents?: Document[];
  currentDocument?: Document | null;
  onSelectDocument?: (doc: Document) => void;
  onDeleteDocument?: (docId: string) => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onCreateNew, 
  searchTerm = '', 
  onSearchChange,
  documents = [],
  currentDocument,
  onSelectDocument,
  onDeleteDocument,
  isCollapsed = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDocumentsPage = location.pathname.startsWith('/documents');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };
  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <svg className="sidebar-logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="18" r="12" fill="#1E88E5"/>
            <path d="M24 12c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>
            <path d="M18 30h12l-6 6-6-6z" fill="#1E88E5"/>
            <circle cx="20" cy="16" r="1" fill="white"/>
            <circle cx="28" cy="20" r="1" fill="white"/>
          </svg>
          {!isCollapsed && <h1 className="sidebar-title">AND COMPANY</h1>}
        </div>
      </div>
      
      <nav className="sidebar-menu">
        {/* Documents 페이지에서 문서 관련 기능들 */}
        {isDocumentsPage && !isCollapsed && (
          <div className="document-actions-in-sidebar">
            {/* 새 페이지, 새 폴더 버튼 */}
            <button 
              className="sidebar-action-btn primary"
              onClick={onCreateNew}
              title="새 페이지 만들기"
            >
              <Plus className="action-icon" />
              새 페이지
            </button>
            <button 
              className="sidebar-action-btn secondary"
              onClick={() => {
                if (onSelectDocument) {
                  onSelectDocument(null as any);
                }
                navigate('/documents');
              }}
              title="전체 문서 보기"
            >
              <FileText className="action-icon" />
              전체 문서
            </button>
            <button 
              className="sidebar-action-btn secondary"
              onClick={() => navigate('/favorites')}
              title="즐겨찾기 문서 보기"
            >
              <Star className="action-icon" />
              즐겨찾기 문서
            </button>
            <button 
              className="sidebar-action-btn secondary"
              onClick={() => navigate('/password-protected')}
              title="비밀번호 보호 문서 보기"
            >
              <Lock className="action-icon" />
              비밀번호 문서
            </button>
            <button 
              className="sidebar-action-btn secondary"
              onClick={() => navigate('/trash')}
              title="휴지통 보기"
            >
              <Trash2 className="action-icon" />
              휴지통
            </button>

            <div className="sidebar-divider"></div>

            {/* 최근 문서 목록 */}
            <div className="recent-documents-sidebar">
              <h3 className="recent-docs-title">최근 문서</h3>
              <div className="recent-docs-list">
                {filteredDocuments.length === 0 ? (
                  <div className="empty-state">
                    {searchTerm ? (
                      <p className="empty-message">검색 결과가 없습니다</p>
                    ) : (
                      <p className="empty-message">아직 문서가 없습니다</p>
                    )}
                  </div>
                ) : (
                  filteredDocuments.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      className={`sidebar-document-item ${currentDocument?.id === doc.id ? 'active' : ''}`}
                      onClick={() => onSelectDocument?.(doc)}
                    >
                      <div className="sidebar-doc-content">
                        <div className="sidebar-doc-header">
                          <FileText className="sidebar-doc-icon" />
                          {doc.isFavorite && <Star className="favorite-icon" />}
                          {doc.isPasswordProtected && <Lock className="password-icon" />}
                          <span className="sidebar-doc-title">
                            {doc.title || 'Untitled'}
                          </span>
                        </div>
                        <div className="sidebar-doc-meta">
                          <span className="sidebar-doc-date">
                            {formatDate(doc.updatedAt)}
                          </span>
                          <button
                            className="sidebar-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument?.(doc.id);
                            }}
                            title="문서 삭제"
                          >
                            <Trash2 className="delete-icon" />
                          </button>
                        </div>
                        {doc.content && (
                          <p className="sidebar-doc-preview">
                            {doc.content.substring(0, 40)}...
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        {/* Documents 페이지가 아닐 때만 일반 메뉴 표시 */}
        {!isDocumentsPage && (
          <>
            <button
              onClick={() => navigate('/')}
              className={`menu-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              <HomeIcon className="menu-item-icon" />
              {!isCollapsed && 'Home'}
            </button>
            <button
              onClick={() => navigate('/documents')}
              className="menu-item"
            >
              <InvoiceIcon className="menu-item-icon" />
              {!isCollapsed && 'Documents'}
            </button>
            <button
              onClick={() => navigate('/schedule')}
              className="menu-item"
            >
              <Calendar className="menu-item-icon" />
              {!isCollapsed && 'Schedule'}
            </button>
            <button
              onClick={() => navigate('/report')}
              className="menu-item"
            >
              <BarChart3 className="menu-item-icon" />
              {!isCollapsed && 'Report'}
            </button>
          </>
        )}
      </nav>

      {!isCollapsed && (
        <div className="sidebar-footer">
        <div className="settings-section">
          <div className="settings-header">
            <SettingsIcon className="settings-icon" />
            <span className="settings-title">Settings</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
      )}
    </div>
  );
};

export default Sidebar;