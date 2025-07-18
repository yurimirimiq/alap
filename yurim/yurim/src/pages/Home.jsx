import ChatPanel from "../components/ChatPanel";
import WorkspacePanel from "../components/WorkspacePanel";

export default function Home({ user }) {
  return (
    <div className="container">
      {/* 순서 변경: 워크스페이스 먼저, 채팅 나중 */}
      <WorkspacePanel />
      <ChatPanel user={user} />
    </div>
  );
}
