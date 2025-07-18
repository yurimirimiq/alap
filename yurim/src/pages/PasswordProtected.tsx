import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, FileText, Trash2, Search, ArrowLeft, Eye } from 'lucide-react';
import { Document } from '../types/document';

const PasswordProtected = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 마스터 비밀번호 (실제로는 더 안전한 방식으로 관리해야 함)
  const MASTER_PASSWORD = 'admin123';

  // 로컬 스토리지에서 문서 불러오기
  useEffect(() => {
    const loadDocuments = () => {
      const savedDocs = localStorage.getItem('workspace-documents');
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        const docsWithDates = parsedDocs.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
        setDocuments(docsWithDates);
      }
    };

    loadDocuments();
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      loadDocuments();
    };
    
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(loadDocuments, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 비밀번호 보호 문서만 필터링
  const passwordProtectedDocuments = documents.filter(doc => doc.isPasswordProtected && !doc.isDeleted);

  // 검색 필터링
  const filteredDocuments = passwordProtectedDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 마스터 비밀번호 확인
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPassword === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  // 비밀번호 보호 해제
  const removePasswordProtection = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 문서의 비밀번호 보호를 해제하시겠습니까?')) {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, isPasswordProtected: false, password: undefined } : doc
      );
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
    }
  };

  // 문서 삭제 (휴지통으로 이동)
  const deleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 문서를 휴지통으로 이동하시겠습니까?')) {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, isDeleted: true, deletedAt: new Date() } : doc
      );
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
    }
  };

  // 문서 열기
  const openDocument = (doc: Document) => {
    navigate(`/documents/${doc.id}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWordCount = (content: string) => {
    return content.trim().length;
  };

  // 인증되지 않은 경우 비밀번호 입력 화면
  if (!isAuthenticated) {
    return (
      <div className="password-auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <button
              onClick={() => navigate('/documents')}
              className="back-button"
            >
              <ArrowLeft size={20} />
              뒤로 가기
            </button>
          </div>
          
          <div className="auth-content">
            <div className="auth-icon">
              <Lock size={48} />
            </div>
            <h1 className="auth-title">비밀번호 보호 문서</h1>
            
            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <div className="password-input-group">
                <input
                  type="password"
                  value={enteredPassword}
                  onChange={(e) => setEnteredPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="password-input"
                  autoFocus
                />
                {passwordError && (
                  <div className="password-error">{passwordError}</div>
                )}
              </div>
              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={!enteredPassword.trim()}
              >
                확인
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-protected-page">
      <div className="password-protected-header">
        <button
          onClick={() => navigate('/documents')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          뒤로 가기
        </button>
        
        <div className="password-protected-title-section">
          <h1 className="password-protected-title">
            <Lock className="title-icon" />
            비밀번호 보호 문서
          </h1>
          <p className="password-protected-subtitle">보안이 필요한 문서들을 안전하게 관리하세요</p>
        </div>

        <div className="password-protected-search">
          <input
            type="text"
            placeholder="보호된 문서 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search className="search-icon" />
        </div>
      </div>

      <div className="password-protected-content">
        {filteredDocuments.length === 0 ? (
          <div className="empty-password-protected">
            <Lock className="empty-icon" />
            <h3 className="empty-title">
              {searchTerm ? '검색 결과가 없습니다' : '비밀번호 보호된 문서가 없습니다'}
            </h3>
            <p className="empty-description">
              {searchTerm 
                ? '다른 검색어로 시도해보세요' 
                : '문서 편집 시 자물쇠 버튼을 눌러 비밀번호 보호를 설정해보세요'
              }
            </p>
            {!searchTerm && (
              <button 
                className="create-document-btn"
                onClick={() => navigate('/documents')}
              >
                문서 만들러 가기
              </button>
            )}
          </div>
        ) : (
          <div className="password-protected-grid">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="password-protected-card"
                onClick={() => openDocument(doc)}
              >
                <div className="card-header">
                  <div className="card-title-section">
                    <FileText className="doc-icon" />
                    <h3 className="card-title">{doc.title || 'Untitled'}</h3>
                    <Lock className="password-indicator" size={14} />
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-btn unlock"
                      onClick={(e) => removePasswordProtection(doc.id, e)}
                      title="비밀번호 보호 해제"
                    >
                      <Lock size={16} />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={(e) => deleteDocument(doc.id, e)}
                      title="휴지통으로 이동"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  <p className="card-preview protected">
                    🔒 이 문서는 비밀번호로 보호되어 있습니다
                  </p>
                </div>

                <div className="card-footer">
                  <div className="card-meta">
                    <span className="meta-item">
                      {getWordCount(doc.content)}자
                    </span>
                    <span className="meta-divider">•</span>
                    <span className="meta-item">
                      {formatDate(doc.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordProtected;