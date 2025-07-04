import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim()); // App에 사용자 정보 전달
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">사용자 이름:</label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="닉네임을 입력하세요"
        style={{
          display: "block",
          width: "100%",
          padding: "8px",
          marginTop: "8px",
          marginBottom: "12px",
          fontSize: "16px",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "8px 16px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        로그인
      </button>
    </form>
  );
}
