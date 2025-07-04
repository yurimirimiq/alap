export default function Message({ text, sender }) {
  const isMe = sender === "나";
  return (
    <div
      className="message"
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        backgroundColor: isMe ? "#d1e7dd" : "#e1f5fe",
      }}
    >
      {text}
    </div>
  );
}
