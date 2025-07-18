import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Document } from '../types/document';

const Favorites = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  // 즐겨찾기 문서만 필터링
  const favoriteDocuments = documents.filter(doc => doc.isFavorite);

  // 검색 필터링
  const filteredDocuments = favoriteDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 즐겨찾기 해제
  const removeFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedDocs = documents.map(doc => 
      doc.id === docId ? { ...doc, isFavorite: false } : doc
    );
    localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
    setDocuments(updatedDocs);
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

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <button
          onClick={() => navigate('/documents')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          뒤로 가기
        </button>
        
        <div className="favorites-title-section">
          <h1 className="favorites-title">
            <Star className="title-icon" />
            즐겨찾기 문서
          </h1>
          <p className="favorites-subtitle">중요한 문서들을 한눈에 확인하세요</p>
        </div>

        <div className="favorites-search">
          <input
            type="text"
            placeholder="즐겨찾기 문서 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Search className="search-icon" />
        </div>
      </div>

      <div className="favorites-content">
        {filteredDocuments.length === 0 ? (
          <div className="empty-favorites">
            <Star className="empty-icon" />
            <h3 className="empty-title">
              {searchTerm ? '검색 결과가 없습니다' : '즐겨찾기한 문서가 없습니다'}
            </h3>
            <p className="empty-description">
              {searchTerm 
                ? '다른 검색어로 시도해보세요' 
                : '문서 편집 시 별표 버튼을 눌러 즐겨찾기에 추가해보세요'
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
          <div className="favorites-grid">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="favorite-card"
                onClick={() => openDocument(doc)}
              >
                <div className="card-header">
                  <div className="card-title-section">
                    <FileText className="doc-icon" />
                    <h3 className="card-title">{doc.title || 'Untitled'}</h3>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-btn favorite-active"
                      onClick={(e) => removeFavorite(doc.id, e)}
                      title="즐겨찾기에서 제거"
                    >
                      <Star size={16} />
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
                  {doc.content ? (
                    <p className="card-preview">
                      {doc.content.substring(0, 120)}...
                    </p>
                  ) : (
                    <p className="card-preview empty">내용이 없습니다</p>
                  )}
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

export default Favorites;