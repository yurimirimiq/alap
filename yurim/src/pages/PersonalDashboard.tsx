import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText, TrendingUp, Star, CheckCircle, Plus } from 'lucide-react';
import { Document } from '../types/document';

interface PersonalDashboardProps {
  documents?: Document[];
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ documents = [] }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');

  // 사용자 이름 로드
  useEffect(() => {
    const savedName = localStorage.getItem('user-name');
    setUserName(savedName || '');
  }, []);

  // 최근 문서 (최대 3개)
  const recentDocuments = documents
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  // 오늘 날짜
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 이번 주 시작 날짜 (월요일)
  const thisWeekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  thisWeekStart.setDate(today.getDate() - daysToMonday);
  thisWeekStart.setHours(0, 0, 0, 0);

  // 통계 계산
  const totalDocuments = documents.length;
  const thisWeekDocuments = documents.filter(doc => 
    new Date(doc.createdAt) >= thisWeekStart
  ).length;
  
  // 즐겨찾기는 localStorage에서 관리
  const getFavorites = () => {
    const favorites = localStorage.getItem('workspace-favorites');
    return favorites ? JSON.parse(favorites) : [];
  };

  const favoriteDocuments = getFavorites().length;

  // 완료된 작업은 localStorage에서 관리
  const getCompletedTasks = () => {
    // 전체 일정에서 완료된 작업 개수 계산
    const allTasks = localStorage.getItem('workspace-all-tasks');
    if (allTasks) {
      const parsedTasks = JSON.parse(allTasks);
      return parsedTasks.filter((task: any) => task.completed);
    }
    return [];
  };

  const completedTasks = getCompletedTasks().length;

  // 오늘 일정 (localStorage에서 관리)
  const getTodayTasks = () => {
    const tasks = localStorage.getItem('workspace-today-tasks');
    if (tasks) {
      return JSON.parse(tasks);
    }
    
    // 전체 일정에서 오늘 일정 가져오기
    const allTasks = localStorage.getItem('workspace-all-tasks');
    if (allTasks) {
      const parsedTasks = JSON.parse(allTasks);
      const today = new Date().toISOString().split('T')[0];
      const todayTasksFromAll = parsedTasks.filter((task: any) => task.date === today);
      if (todayTasksFromAll.length > 0) {
        return todayTasksFromAll;
      }
    }
    
    // 기본 일정
    return [
      { id: 1, task: '프로젝트 리뷰 미팅', time: '14:00', completed: false },
      { id: 2, task: '문서 작성 완료', time: '16:30', completed: true },
      { id: 3, task: '클라이언트 피드백 정리', time: '18:00', completed: false },
    ];
  };

  const [todayTasks, setTodayTasks] = React.useState(getTodayTasks());

  // 일정 변경 감지를 위한 useEffect
  React.useEffect(() => {
    const handleStorageChange = () => {
      setTodayTasks(getTodayTasks());
    };

    // localStorage 변경 감지
    window.addEventListener('storage', handleStorageChange);
    
    // 컴포넌트 내에서의 변경도 감지하기 위한 interval
    const interval = setInterval(() => {
      const currentTasks = getTodayTasks();
      if (JSON.stringify(currentTasks) !== JSON.stringify(todayTasks)) {
        setTodayTasks(currentTasks);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [todayTasks]);

  const stats = [
    { label: '총 문서', value: totalDocuments.toString(), icon: FileText, color: 'blue' },
    { label: '이번 주 작성', value: thisWeekDocuments.toString(), icon: TrendingUp, color: 'green' },
    { label: '즐겨찾기', value: favoriteDocuments.toString(), icon: Star, color: 'yellow' },
    { label: '완료된 작업', value: completedTasks.toString(), icon: CheckCircle, color: 'purple' },
  ];

  // 작업 완료 토글
  const toggleTaskCompletion = (taskId: number) => {
    // 전체 일정에서 해당 작업 토글
    const allTasks = localStorage.getItem('workspace-all-tasks');
    if (allTasks) {
      const parsedTasks = JSON.parse(allTasks);
      const updatedAllTasks = parsedTasks.map((task: any) => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      localStorage.setItem('workspace-all-tasks', JSON.stringify(updatedAllTasks));
      
      // 오늘 일정만 다시 필터링
      const today = new Date().toISOString().split('T')[0];
      const updatedTodayTasks = updatedAllTasks.filter((task: any) => task.date === today);
      setTodayTasks(updatedTodayTasks);
      localStorage.setItem('workspace-today-tasks', JSON.stringify(updatedTodayTasks));
    } else {
      // 기본 오늘 일정만 업데이트 (fallback)
      const updatedTasks = todayTasks.map((task: any) => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTodayTasks(updatedTasks);
      localStorage.setItem('workspace-today-tasks', JSON.stringify(updatedTasks));
    }
  };

  // 새 문서 작성
  const createNewDocument = () => {
    // 새 문서 생성
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 기존 문서들과 함께 저장
    const updatedDocs = [...documents, newDoc];
    localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
    
    // Documents 페이지로 이동하면서 새 문서 편집
    navigate(`/documents/${newDoc.id}`);
  };

  // 일정 추가
  const addSchedule = () => {
    navigate('/schedule');
  };

  // 리포트 보기
  const viewReport = () => {
    navigate('/report');
  };

  // 문서 클릭 시 해당 문서로 이동
  const openDocument = (doc: Document) => {
    navigate(`/documents/${doc.id}`);
  };

  // 문서 삭제 (휴지통으로 이동)
  const deleteDocument = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 문서를 휴지통으로 이동하시겠습니까?')) {
      const updatedDocs = documents.map(doc => 
        doc.id === docId ? { ...doc, isDeleted: true, deletedAt: new Date() } : doc
      );
      localStorage.setItem('workspace-documents', JSON.stringify(updatedDocs));
      // 페이지 새로고침으로 변경사항 반영
      window.location.reload();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="personal-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">
            {userName ? `${userName}님 안녕하세요! 👋` : '안녕하세요! 👋'}
          </h1>
          <p className="dashboard-subtitle">오늘도 생산적인 하루 되세요</p>
        </div>
        <div className="current-time">
          <Clock className="time-icon" />
          <span className="time-text">{new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stats-section">
          <h2 className="section-title">통계</h2>
          <div className="stats-grid">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`stat-card ${stat.color}`}>
                  <div className="stat-icon">
                    <Icon size={24} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="recent-documents">
          <h2 className="section-title">최근 문서</h2>
          <div className="document-list">
            {recentDocuments.length === 0 ? (
              <div className="empty-state">
                <p className="empty-message">아직 문서가 없습니다</p>
                <button 
                  className="action-btn primary"
                  onClick={createNewDocument}
                  style={{ marginTop: '12px' }}
                >
                  <Plus size={16} />
                  첫 문서 만들기
                </button>
              </div>
            ) : (
              recentDocuments.map((doc) => (
                <div 
                  key={doc.id} 
                  className="recent-doc-item"
                  onClick={() => openDocument(doc)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="doc-info">
                    <FileText className="doc-icon" />
                    <div className="doc-details">
                      <h3 className="doc-title">{doc.title || 'Untitled'}</h3>
                      <p className="doc-meta">{formatDate(doc.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="doc-status editing">편집 중</div>
                </div>
              ))
            )}
            {recentDocuments.length > 0 && (
              <div className="recent-docs-actions">
                <button 
                  className="view-all-btn"
                  onClick={() => navigate('/documents')}
                >
                  모든 문서 보기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="today-schedule">
          <h2 className="section-title">오늘 일정</h2>
          <div className="schedule-list">
            {todayTasks.map((task: any) => (
              <div 
                key={task.id} 
                className={`schedule-item ${task.completed ? 'completed' : ''}`}
                onClick={() => toggleTaskCompletion(task.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="task-time">{task.time}</div>
                <div className="task-content">
                  <span className="task-text">{task.task}</span>
                  {task.completed && <CheckCircle className="completed-icon" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions">
          <h2 className="section-title">빠른 작업</h2>
          <div className="action-buttons">
            <button 
              className="action-btn primary"
              onClick={createNewDocument}
            >
              <FileText size={20} />
              새 문서 작성
            </button>
            <button 
              className="action-btn secondary"
              onClick={addSchedule}
            >
              <Calendar size={20} />
              일정 추가
            </button>
            <button 
              className="action-btn secondary"
              onClick={viewReport}
            >
              <TrendingUp size={20} />
              리포트 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;