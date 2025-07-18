import { useState } from "react";
import TextBlock from "./blocks/TextBlock";

export default function WorkspacePanel() {
  const [blocks, setBlocks] = useState([{ id: 1, text: "" }]);

  const handleChange = (id, value) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, text: value } : block))
    );
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const index = blocks.findIndex((b) => b.id === id);
      const newBlock = { id: Date.now(), text: "" };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else if (e.key === "Backspace" && !e.target.value) {
      e.preventDefault();
      if (blocks.length === 1) return;
      setBlocks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="workspace-panel">
      <h2>📝 워크스페이스</h2>
      {blocks.map((block) => (
        <TextBlock
          key={block.id}
          id={block.id}
          text={block.text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      ))}
    </div>
  );
}
