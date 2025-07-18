export default function TextBlock({ id, text, onChange, onKeyDown }) {
  return (
    <div>
      <input
        type="text"
        value={text}
        placeholder="내용을 입력하세요..."
        onChange={(e) => onChange(id, e.target.value)}
        onKeyDown={(e) => onKeyDown(e, id)}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: "16px",
          border: "none",
          borderBottom: "1px solid #ccc",
          outline: "none",
          marginBottom: "4px",
          backgroundColor: "transparent",
        }}
      />
    </div>
  );
}
