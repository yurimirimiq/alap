import { useState, useRef, useEffect } from "react";
import Message from "./Message";

export default function ChatPanel({ user }) {
  const [messages, setMessages] = useState([
    { text: "안녕하세요!", sender: "상대" },
    { text: "무엇을 도와드릴까요?", sender: "상대" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages([...messages, { text: trimmed, sender: user || "나" }]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 엔터 중복 방지
      sendMessage();
    }
  };

  // 채팅창 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-panel">
      <div className="header">💬 채팅</div>
      <div className="message-list">
        {messages.map((msg, i) => (
          <Message
            key={i}
            text={msg.text}
            sender={msg.sender === user ? "나" : msg.sender}
            isMine={msg.sender === user}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="input-box">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={sendMessage}>전송</button>
      </div>
    </div>
  );
}
