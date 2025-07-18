import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, FileText, RotateCcw, X, Search, ArrowLeft, Check } from 'lucide-react';
import { Document } from '../types/document';

const Trash = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'restore' | 'delete' | null>(null);

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
          deletedAt: doc.deletedAt ? new Date(doc.deletedAt) : undefined,
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

  // 삭제된 문서만 필터링
  const deletedDocuments = documents.filter(doc => doc.isDeleted);

  // 검색 필터링
  const filteredDocuments = deletedDocuments.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 문서 선택/해제
  const toggleDocumentSelection = (docId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)));
    }
  };

  // 문서 복원
  const restoreDocument = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('이 문서를 복원하시겠습니까?')) {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, isDeleted: false, deletedAt: undefined } : doc
      );
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
    }
  };

  // 문서 영구 삭제
  const permanentlyDeleteDocument = (docId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('이 문서를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setSelectedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  // 일괄 복원
  const bulkRestore = () => {
    if (selectedDocuments.size === 0) return;
    
    if (confirm(`선택한 ${selectedDocuments.size}개의 문서를 복원하시겠습니까?`)) {
      const updatedDocs = documents.map(doc => 
        selectedDocuments.has(doc.id) ? { ...doc, isDeleted: false, deletedAt: undefined } : doc
      );
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setSelectedDocuments(new Set());
      setBulkAction(null);
    }
  };

  // 일괄 영구 삭제
  const bulkPermanentDelete = () => {
    if (selectedDocuments.size === 0) return;
    
    if (confirm(`선택한 ${selectedDocuments.size}개의 문서를 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      const updatedDocs = documents.filter(doc => !selectedDocuments.has(doc.id));
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setSelectedDocuments(new Set());
      setBulkAction(null);
    }
  };

  // 일괄 작업 실행
  const executeBulkAction = () => {
    if (bulkAction === 'restore') {
      bulkRestore();
    } else if (bulkAction === 'delete') {
      bulkPermanentDelete();
    }
  };

  // 휴지통 비우기
  const emptyTrash = () => {
    if (confirm('휴지통을 완전히 비우시겠습니까? 모든 문서가 영구적으로 삭제됩니다.')) {
      const updatedDocs = documents.filter(doc => !doc.isDeleted);
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      setDocuments(updatedDocs);
      setSelectedDocuments(new Set());
      setBulkAction(null);
    }
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
    <div className="trash-page">
      <div className="trash-header">
        <button
          onClick={() => navigate('/documents')}
          className="back-button"
        >
          <ArrowLeft size={20} />
          뒤로 가기
        </button>
        
        <div className="trash-title-section">
          <h1 className="trash-title">
            <Trash2 className="title-icon" />
            휴지통
          </h1>
          <p className="trash-subtitle">삭제된 문서들을 복원하거나 영구 삭제할 수 있습니다</p>
        </div>

        <div className="trash-actions">
          <div className="trash-search">
            <input
              type="text"
              placeholder="휴지통에서 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="search-icon" />
          </div>
          
          {deletedDocuments.length > 0 && (
            <button 
              className="empty-trash-btn"
              onClick={emptyTrash}
            >
              <Trash2 size={16} />
              휴지통 비우기
            </button>
          )}
        </div>
      </div>

      {/* 일괄 작업 컨트롤 */}
      {filteredDocuments.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-select-section">
            <label className="bulk-select-all">
              <input
                type="checkbox"
                checked={selectedDocuments.size === filteredDocuments.length && filteredDocuments.length > 0}
                onChange={toggleSelectAll}
                className="bulk-checkbox"
              />
              <span className="bulk-select-text">
                전체 선택 ({selectedDocuments.size}/{filteredDocuments.length})
              </span>
            </label>
          </div>

          <div className="bulk-action-buttons">
            <button
              className={`bulk-action-btn restore ${bulkAction === 'restore' ? 'active' : ''}`}
              onClick={() => setBulkAction(bulkAction === 'restore' ? null : 'restore')}
              disabled={selectedDocuments.size === 0}
            >
              <RotateCcw size={16} />
              복원
            </button>
            <button
              className={`bulk-action-btn delete ${bulkAction === 'delete' ? 'active' : ''}`}
              onClick={() => setBulkAction(bulkAction === 'delete' ? null : 'delete')}
              disabled={selectedDocuments.size === 0}
            >
              <X size={16} />
              영구삭제
            </button>
          </div>

          {bulkAction && selectedDocuments.size > 0 && (
            <button
              className="bulk-confirm-btn"
              onClick={executeBulkAction}
            >
              <Check size={16} />
              확인 ({selectedDocuments.size}개)
            </button>
          )}
        </div>
      )}

      <div className="trash-content">
        {filteredDocuments.length === 0 ? (
          <div className="empty-trash">
            <Trash2 className="empty-icon" />
            <h3 className="empty-title">
              {searchTerm ? '검색 결과가 없습니다' : '휴지통이 비어있습니다'}
            </h3>
            <p className="empty-description">
              {searchTerm 
                ? '다른 검색어로 시도해보세요' 
                : '삭제된 문서가 없습니다. 깔끔하게 정리되어 있네요!'
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
          <div className="trash-grid">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className={`trash-card ${selectedDocuments.has(doc.id) ? 'selected' : ''}`}
              >
                <div className="card-selection">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.has(doc.id)}
                    onChange={() => toggleDocumentSelection(doc.id)}
                    className="document-checkbox"
                  />
                  {selectedDocuments.has(doc.id) && (
                    <div className="selection-indicator">
                      <Check size={16} />
                    </div>
                  )}
                </div>

                <div className="card-header">
                  <div className="card-title-section">
                    <FileText className="doc-icon" />
                    <h3 className="card-title">{doc.title || 'Untitled'}</h3>
                    <div className="document-badges">
                      {doc.isFavorite && <span className="badge favorite">⭐</span>}
                      {doc.isPasswordProtected && <span className="badge password">🔒</span>}
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-btn restore"
                      onClick={(e) => restoreDocument(doc.id, e)}
                      title="문서 복원"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      className="action-btn delete-permanent"
                      onClick={(e) => permanentlyDeleteDocument(doc.id, e)}
                      title="영구 삭제"
                    >
                      <X size={16} />
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
                      삭제: {doc.deletedAt ? formatDate(doc.deletedAt) : '알 수 없음'}
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

export default Trash;