import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar.tsx';
import PersonalDashboard from '../components/PersonalDashboard.tsx';
import { Document } from '../types/document';

const Home = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  // 문서 로드 함수
  const loadDocuments = useCallback(() => {
    const savedDocs = localStorage.getItem('workspace-documents');
    if (savedDocs) {
      const parsedDocs = JSON.parse(savedDocs);
      // Date 객체로 변환
      const docsWithDates = parsedDocs.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
      setDocuments(docsWithDates);
    }
  }, []);

  // 로컬 스토리지에서 문서 불러오기
  useEffect(() => {
    loadDocuments();
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      loadDocuments();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 같은 탭에서의 변경도 감지하기 위한 interval
    const interval = setInterval(loadDocuments, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <PersonalDashboard documents={documents} />
    </div>
  );
};

export default Home;