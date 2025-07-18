import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, CheckCircle, Calendar, Star, PieChart, Activity } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Document } from '../types/document';

const Report = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // 문서 데이터 로드
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

    // 일정 데이터 로드
    const savedTasks = localStorage.getItem('workspace-all-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // 즐겨찾기 로드
    const savedFavorites = localStorage.getItem('workspace-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // 날짜 계산 함수들
  const today = new Date();
  const thisWeekStart = new Date(today);
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  thisWeekStart.setDate(today.getDate() - daysToMonday);
  thisWeekStart.setHours(0, 0, 0, 0);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  // 통계 계산
  const stats = {
    totalDocuments: documents.length,
    thisWeekDocuments: documents.filter(doc => new Date(doc.createdAt) >= thisWeekStart).length,
    thisMonthDocuments: documents.filter(doc => new Date(doc.createdAt) >= thisMonthStart).length,
    totalTasks: tasks.length,
    completedTasksCount: tasks.filter(task => task.completed).length,
    pendingTasks: tasks.filter(task => !task.completed).length,
    favoriteDocuments: favorites.length,
  };

  // 최근 7일간 문서 생성 통계
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyDocuments = last7Days.map(date => {
    const count = documents.filter(doc => 
      doc.createdAt.toISOString().split('T')[0] === date
    ).length;
    return { date, count };
  });

  // 우선순위별 작업 통계
  const tasksByPriority = {
    high: tasks.filter(task => task.priority === 'high').length,
    medium: tasks.filter(task => task.priority === 'medium').length,
    low: tasks.filter(task => task.priority === 'low').length,
  };

  // 최근 활동
  const recentActivities = [
    ...documents.slice(0, 3).map(doc => ({
      type: 'document',
      title: `문서 "${doc.title}" 수정됨`,
      time: doc.updatedAt,
      icon: FileText,
    })),
    ...tasks.filter(task => task.completed).slice(0, 2).map(task => ({
      type: 'task',
      title: `작업 "${task.task}" 완료됨`,
      time: new Date(),
      icon: CheckCircle,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="report-page">
        <div className="report-header">
          <div className="report-title-section">
            <h1 className="report-title">📊 워크스페이스 리포트</h1>
            <p className="report-subtitle">생산성 분석과 인사이트를 확인해보세요</p>
          </div>
          <div className="report-date">
            <Calendar className="date-icon" />
            <span>{today.toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        <div className="report-content">
          {/* 주요 통계 */}
          <div className="stats-overview">
            <h2 className="section-title">📈 주요 통계</h2>
            <div className="stats-grid">
              <div className="stat-card blue">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.totalDocuments}</div>
                  <div className="stat-label">총 문서</div>
                  <div className="stat-change">
                    이번 주 +{stats.thisWeekDocuments}
                  </div>
                </div>
              </div>
              
              <div className="stat-card green">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.completedTasksCount}</div>
                  <div className="stat-label">완료된 작업</div>
                  <div className="stat-change">
                    대기 중 {stats.pendingTasks}개
                  </div>
                </div>
              </div>

              <div className="stat-card yellow">
                <div className="stat-icon">
                  <Star size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.favoriteDocuments}</div>
                  <div className="stat-label">즐겨찾기</div>
                  <div className="stat-change">
                    전체의 {Math.round((stats.favoriteDocuments / Math.max(stats.totalDocuments, 1)) * 100)}%
                  </div>
                </div>
              </div>

              <div className="stat-card purple">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{stats.thisMonthDocuments}</div>
                  <div className="stat-label">이번 달 작성</div>
                  <div className="stat-change">
                    일평균 {Math.round(stats.thisMonthDocuments / today.getDate() * 10) / 10}개
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="report-grid">
            {/* 문서 생성 트렌드 */}
            <div className="chart-section">
              <h3 className="chart-title">
                <BarChart3 size={20} />
                최근 7일 문서 생성 현황
              </h3>
              <div className="chart-container">
                <div className="bar-chart">
                  {dailyDocuments.map((day, index) => (
                    <div key={day.date} className="bar-item">
                      <div 
                        className="bar" 
                        style={{ 
                          height: `${Math.max(day.count * 20, 4)}px`,
                          backgroundColor: day.count > 0 ? '#3B82F6' : '#E5E7EB'
                        }}
                      ></div>
                      <div className="bar-label">
                        {new Date(day.date).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="bar-value">{day.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 작업 우선순위 분포 */}
            <div className="chart-section">
              <h3 className="chart-title">
                <PieChart size={20} />
                작업 우선순위 분포
              </h3>
              <div className="priority-chart">
                <div className="priority-item">
                  <div className="priority-color high"></div>
                  <span className="priority-label">높음</span>
                  <span className="priority-value">{tasksByPriority.high}개</span>
                </div>
                <div className="priority-item">
                  <div className="priority-color medium"></div>
                  <span className="priority-label">보통</span>
                  <span className="priority-value">{tasksByPriority.medium}개</span>
                </div>
                <div className="priority-item">
                  <div className="priority-color low"></div>
                  <span className="priority-label">낮음</span>
                  <span className="priority-value">{tasksByPriority.low}개</span>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="activity-section">
              <h3 className="section-title">
                <Activity size={20} />
                최근 활동
              </h3>
              <div className="activity-list">
                {recentActivities.length === 0 ? (
                  <div className="empty-activity">
                    <p>최근 활동이 없습니다</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <Icon size={16} />
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">{activity.title}</div>
                          <div className="activity-time">
                            {new Date(activity.time).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 생산성 인사이트 */}
            <div className="insights-section">
              <h3 className="section-title">💡 생산성 인사이트</h3>
              <div className="insights-list">
                <div className="insight-item">
                  <div className="insight-icon">📝</div>
                  <div className="insight-content">
                    <div className="insight-title">문서 작성 패턴</div>
                    <div className="insight-description">
                      이번 주 평균 {Math.round(stats.thisWeekDocuments / 7 * 10) / 10}개의 문서를 작성했습니다.
                    </div>
                  </div>
                </div>
                
                <div className="insight-item">
                  <div className="insight-icon">✅</div>
                  <div className="insight-content">
                    <div className="insight-title">작업 완료율</div>
                    <div className="insight-description">
                      전체 작업의 {Math.round((stats.completedTasksCount / Math.max(stats.totalTasks, 1)) * 100)}%를 완료했습니다.
                    </div>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-icon">⭐</div>
                  <div className="insight-content">
                    <div className="insight-title">즐겨찾기 활용</div>
                    <div className="insight-description">
                      {stats.favoriteDocuments > 0 
                        ? `${stats.favoriteDocuments}개의 문서를 즐겨찾기로 관리하고 있습니다.`
                        : '즐겨찾기 기능을 활용해 중요한 문서를 관리해보세요.'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;