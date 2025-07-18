import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import DocumentEditor from '../components/DocumentEditor';
import MulticulturalChat from '../components/MulticulturalChat';
import { Document } from '../types/document';

const Documents = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordDocument, setPasswordDocument] = useState<Document | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // 로컬 스토리지에서 문서 불러오기
  useEffect(() => {
    const savedDocs = localStorage.getItem('workspace-documents');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs);
      setDocuments(parsedDocs);
      
      if (pageId) {
        const doc = parsedDocs.find((d: Document) => d.id === pageId);
        if (doc) {
          setCurrentDocument(doc);
        }
      }
    }
  }, [pageId]);

  // 문서 저장
  const saveDocuments = (docs: Document[]) => {
    localStorage.setItem('workspace-documents', JSON.stringify(docs));
    setDocuments(docs);
  };

  // 새 문서 생성
  const createNewDocument = (type?: string) => {
    if (type === 'password') {
      // 비밀번호 보호 문서 생성
      const password = prompt('문서에 설정할 비밀번호를 입력하세요:');
      if (!password) return;
      
      const newDoc: Document = {
        id: Date.now().toString(),
        title: 'Untitled (비밀번호 보호)',
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPasswordProtected: true,
        password: password,
      };
      
      const updatedDocs = [...documents, newDoc];
      saveDocuments(updatedDocs);
      setCurrentDocument(newDoc);
      navigate(`/documents/${newDoc.id}`);
      return;
    }
    
    const newDoc: Document = {
      id: Date.now().toString(),
      title: type === 'favorite' ? 'Untitled (즐겨찾기)' : 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isFavorite: type === 'favorite',
    };
    
    const updatedDocs = [...documents, newDoc];
    saveDocuments(updatedDocs);
    setCurrentDocument(newDoc);
    navigate(`/documents/${newDoc.id}`);
  };

  // 문서 업데이트
  const updateDocument = (updatedDoc: Document) => {
    const updatedDocs = documents.map(doc => 
      doc.id === updatedDoc.id ? updatedDoc : doc
    );
    saveDocuments(updatedDocs);
    setCurrentDocument(updatedDoc);
  };

  // 문서 삭제
  const deleteDocument = (docId: string) => {
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, isDeleted: true, deletedAt: new Date() } : doc
    );
    saveDocuments(updatedDocs);
    
    if (currentDocument?.id === docId) {
      setCurrentDocument(null);
      navigate('/documents');
    }
    
    // 토스트 알림 표시
    setToastMessage('휴지통으로 이동됨');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // 문서 선택
  const selectDocument = (doc: Document) => {
    if (doc === null) {
      setCurrentDocument(null);
      navigate('/documents');
      return;
    }
    
    if (doc.isPasswordProtected) {
      setPasswordDocument(doc);
      setShowPasswordModal(true);
      setEnteredPassword('');
      setPasswordError('');
      return;
    }
    
    setCurrentDocument(doc);
    navigate(`/documents/${doc.id}`);
  };

  // 비밀번호 확인
  const handlePasswordSubmit = () => {
    if (passwordDocument && enteredPassword === passwordDocument.password) {
      setCurrentDocument(passwordDocument);
      navigate(`/documents/${passwordDocument.id}`);
      setShowPasswordModal(false);
      setPasswordDocument(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  // 비밀번호 찾기 처리
  const handleForgotPassword = () => {
    if (forgotPasswordData.name && forgotPasswordData.phone && forgotPasswordData.email) {
      alert('인증이 완료되었습니다. 새로운 비밀번호를 설정해주세요.');
      setShowForgotPassword(false);
      setForgotPasswordData({ name: '', phone: '', email: '' });
    } else {
      alert('모든 정보를 입력해주세요.');
    }
  };
  // 즐겨찾기 토글
  const toggleFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, isFavorite: !doc.isFavorite } : doc
    );
    saveDocuments(updatedDocs);
    
    if (currentDocument?.id === docId) {
      setCurrentDocument(updatedDocs.find(doc => doc.id === docId) || null);
    }
  };

  // 비밀번호 보호 토글
  const togglePasswordProtection = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    if (doc.isPasswordProtected) {
      // 비밀번호 보호 해제
      const updatedDocs = documents.map(d => 
        d.id === docId ? { ...d, isPasswordProtected: false, password: undefined } : d
      );
      saveDocuments(updatedDocs);
      
      if (currentDocument?.id === docId) {
        setCurrentDocument(updatedDocs.find(d => d.id === docId) || null);
      }
    } else {
      // 비밀번호 보호 설정
      const password = prompt('문서에 설정할 비밀번호를 입력하세요:');
      if (password) {
        const updatedDocs = documents.map(d => 
          d.id === docId ? { ...d, isPasswordProtected: true, password: password } : d
        );
        saveDocuments(updatedDocs);
        
        if (currentDocument?.id === docId) {
          setCurrentDocument(updatedDocs.find(d => d.id === docId) || null);
        }
      }
    }
  };

  // 검색된 문서들
  const filteredDocuments = documents.filter(doc =>
    !doc.isDeleted &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 사이드바용 필터링 (삭제되지 않은 문서만)
  const sidebarDocuments = documents.filter(doc => 
    !doc.isDeleted &&
    (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };
  return (
    <div className="app-container">
      <div className={`sidebar-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar 
          onCreateNew={createNewDocument}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          documents={sidebarDocuments}
          currentDocument={currentDocument}
          onSelectDocument={selectDocument}
          onDeleteDocument={deleteDocument}
          isCollapsed={isSidebarCollapsed}
        />
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      
      <div className="document-main">
        {currentDocument ? (
          <DocumentEditor
            document={currentDocument}
            onUpdate={updateDocument}
          />
        ) : (
          <div className="documents-overview">
            <div className="documents-header">
              <div className="documents-title-section">
                <span className="documents-icon">📄</span>
                <h1 className="documents-main-title">모든 문서</h1>
              </div>
              
              <div className="documents-search">
                <input
                  type="text"
                  placeholder="문서 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <Search className="search-icon" />
              </div>
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">문서가 없습니다. 새 문서를 만들어보세요!</p>
              </div>
            ) : (
              <div className="documents-list-section">
                <div className="documents-grid">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="document-card"
                      onClick={() => selectDocument(doc)}
                    >
                      <div className="document-card-badges">
                        <button
                          className={`favorite-badge ${doc.isFavorite ? 'active' : ''}`}
                          onClick={(e) => toggleFavorite(doc.id, e)}
                          title={doc.isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
                        >
                          ⭐
                        </button>
                        <button
                          className={`password-badge ${doc.isPasswordProtected ? 'active' : ''}`}
                          onClick={(e) => togglePasswordProtection(doc.id, e)}
                          title={doc.isPasswordProtected ? '비밀번호 보호 해제' : '비밀번호 보호 설정'}
                        >
                          🔒
                        </button>
                      </div>
                      
                      <div className="document-card-header">
                        <div className="document-title-section">
                          <h3 className="document-card-title">
                            {doc.title || 'Untitled'}
                          </h3>
                          <p className="document-card-date">
                            {formatDate(doc.updatedAt)}
                          </p>
                        </div>
                      </div>

                      {doc.content && (
                        <p className="document-card-preview">
                          {doc.content.substring(0, 100)}...
                        </p>
                      )}
                      
                      <button
                        className="delete-card-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        title="문서 삭제"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {currentDocument && (
        <div className={`chat-container ${isChatCollapsed ? 'collapsed' : ''}`}>
          <button 
            className="chat-toggle-btn"
            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
            title={isChatCollapsed ? '채팅창 펼치기' : '채팅창 접기'}
          >
            {isChatCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
          <MulticulturalChat 
            documentId={currentDocument.id}
            documentTitle={currentDocument.title || 'Untitled'}
            isCollapsed={isChatCollapsed}
          />
        </div>
      )}
      
      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content password-modal">
            <h3 className="modal-title">🔒 비밀번호 보호 문서</h3>
            <p className="modal-description">
              {passwordDocument?.password ? '비밀번호를 입력해주세요.' : '비밀번호를 생성해주세요.'}
            </p>
            <div className="password-input-group">
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                placeholder={passwordDocument?.password ? "비밀번호를 입력하세요" : "새 비밀번호를 생성하세요"}
                className="password-input"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                autoFocus
              />
              {passwordError && (
                <div className="password-error">{passwordError}</div>
              )}
              {passwordDocument?.password && (
                <button 
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  비밀번호를 잊으셨나요?
                </button>
              )}
              {passwordDocument?.password && (
                <button 
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowForgotPassword(true)}
                >
                  비밀번호를 잊으셨나요?
                </button>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordDocument(null);
                  setEnteredPassword('');
                  setPasswordError('');
                }}
              >
                취소
              </button>
              <button 
                className="confirm-btn"
                onClick={handlePasswordSubmit}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 토스트 알림 */}
      {showToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

      {/* 비밀번호 찾기 모달 */}
      {showForgotPassword && (
        <div className="modal-overlay">
          <div className="modal-content password-modal">
            <h3 className="modal-title">🔐 비밀번호 찾기</h3>
            <p className="modal-description">
              본인 확인을 위해 다음 정보를 입력해주세요.
            </p>
            <div className="forgot-password-form">
              <div className="form-group">
                <label className="form-label">이름</label>
                <input
                  type="text"
                  value={forgotPasswordData.name}
                  onChange={(e) => setForgotPasswordData({...forgotPasswordData, name: e.target.value})}
                  placeholder="이름을 입력하세요"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">전화번호</label>
                <input
                  type="tel"
                  value={forgotPasswordData.phone}
                  onChange={(e) => setForgotPasswordData({...forgotPasswordData, phone: e.target.value})}
                  placeholder="010-1234-5678"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">이메일</label>
                <input
                  type="email"
                  value={forgotPasswordData.email}
                  onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                  placeholder="your@email.com"
                  className="form-input"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordData({ name: '', phone: '', email: '' });
                }}
              >
                취소
              </button>
              <button 
                className="confirm-btn"
                onClick={handleForgotPassword}
              >
                인증하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Documents;