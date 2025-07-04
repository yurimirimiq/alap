export default function Message({ text, isMine }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          backgroundColor: isMine ? "#d1e7dd" : "#e1f5fe",
          color: "#333",
          padding: "10px 14px",
          borderRadius: "16px",
          maxWidth: "70%",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </div>
  );
}
