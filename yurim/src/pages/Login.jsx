import LoginForm from "../components/LoginForm";

export default function Login({ onLogin }) {
  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>🔐 로그인</h2>
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
