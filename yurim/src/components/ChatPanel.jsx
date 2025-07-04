import { useState } from "react";
import Message from "./Message";

export default function ChatPanel({ user }) {
  const [messages, setMessages] = useState([
    { text: "안녕하세요!", sender: "상대" },
    { text: "무엇을 도와드릴까요?", sender: "상대" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: user }]);
    setInput("");
  };

  return (
    <div className="chat-panel">
      <div className="header">💬 {user} 님의 채팅</div>
      <div className="message-list">
        {messages.map((msg, i) => (
          <Message key={i} text={msg.text} sender={msg.sender === user ? "나" : "상대"} />
        ))}
      </div>
      <div className="input-box">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
