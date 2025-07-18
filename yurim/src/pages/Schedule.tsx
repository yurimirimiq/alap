import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, CheckCircle, Trash2, Edit3 } from 'lucide-react';
import Sidebar from '../components/Sidebar';

interface Task {
  id: number;
  task: string;
  time: string;
  completed: boolean;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

const Schedule = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 로컬 스토리지에서 일정 불러오기
  useEffect(() => {
    const savedTasks = localStorage.getItem('workspace-all-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // 기본 일정 데이터
      const defaultTasks: Task[] = [
        { id: 1, task: '프로젝트 리뷰 미팅', time: '14:00', completed: false, date: new Date().toISOString().split('T')[0], priority: 'high' },
        { id: 2, task: '문서 작성 완료', time: '16:30', completed: true, date: new Date().toISOString().split('T')[0], priority: 'medium' },
        { id: 3, task: '클라이언트 피드백 정리', time: '18:00', completed: false, date: new Date().toISOString().split('T')[0], priority: 'low' },
      ];
      setTasks(defaultTasks);
      localStorage.setItem('workspace-all-tasks', JSON.stringify(defaultTasks));
    }
  }, []);

  // 일정 저장
  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('workspace-all-tasks', JSON.stringify(updatedTasks));
  };

  // 선택된 날짜의 일정 필터링
  const filteredTasks = tasks.filter(task => task.date === selectedDate);

  // 작업 완료 토글
  const toggleTaskCompletion = (taskId: number) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);

    // 오늘 일정을 Home 페이지와 동기화
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = updatedTasks.filter(task => task.date === today);
    localStorage.setItem('workspace-today-tasks', JSON.stringify(todayTasks));
  };

  // 일정 추가/수정
  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      // 수정
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? { ...taskData, id: editingTask.id } : task
      );
      saveTasks(updatedTasks);
    } else {
      // 추가
      const newTask: Task = {
        ...taskData,
        id: Date.now(),
      };
      saveTasks([...tasks, newTask]);
    }
    setShowAddModal(false);
    setEditingTask(null);
  };

  // 일정 삭제
  const deleteTask = (taskId: number) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      saveTasks(updatedTasks);
    }
  };

  // 우선순위 색상
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="schedule-page">
        <div className="schedule-header">
          <div className="schedule-title-section">
            <h1 className="schedule-title">📅 일정 관리</h1>
            <p className="schedule-subtitle">효율적인 시간 관리로 생산성을 높여보세요</p>
          </div>
          <button 
            className="add-task-btn"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            새 일정 추가
          </button>
        </div>

        <div className="schedule-content">
          <div className="date-selector">
            <label className="date-label">날짜 선택:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="tasks-section">
            <h2 className="tasks-title">
              {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 일정
            </h2>
            
            {filteredTasks.length === 0 ? (
              <div className="empty-tasks">
                <Calendar className="empty-icon" />
                <p className="empty-message">이 날짜에 등록된 일정이 없습니다</p>
                <button 
                  className="add-first-task-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  첫 일정 추가하기
                </button>
              </div>
            ) : (
              <div className="tasks-list">
                {filteredTasks
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((task) => (
                    <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <div className="task-main">
                        <div className="task-time-badge">
                          <Clock size={14} />
                          {task.time}
                        </div>
                        <div className="task-content">
                          <h3 className="task-title">{task.task}</h3>
                          <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        </div>
                      </div>
                      <div className="task-actions">
                        <button
                          className={`complete-btn ${task.completed ? 'completed' : ''}`}
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingTask(task);
                            setShowAddModal(true);
                          }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 일정 추가/수정 모달 */}
        {showAddModal && (
          <TaskModal
            task={editingTask}
            selectedDate={selectedDate}
            onSave={handleSaveTask}
            onClose={() => {
              setShowAddModal(false);
              setEditingTask(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

// 일정 추가/수정 모달 컴포넌트
interface TaskModalProps {
  task: Task | null;
  selectedDate: string;
  onSave: (task: Omit<Task, 'id'>) => void;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, selectedDate, onSave, onClose }) => {
  const [taskText, setTaskText] = useState(task?.task || '');
  const [time, setTime] = useState(task?.time || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(task?.priority || 'medium');
  const [date, setDate] = useState(task?.date || selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim() && time) {
      onSave({
        task: taskText.trim(),
        time,
        priority,
        date,
        completed: task?.completed || false,
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">
          {task ? '일정 수정' : '새 일정 추가'}
        </h3>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label className="form-label">일정 내용</label>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              placeholder="일정을 입력하세요"
              className="form-input"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">시간</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="form-select"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              취소
            </button>
            <button type="submit" className="save-btn">
              {task ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Schedule;