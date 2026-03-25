import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <iframe
        src="https://smf-chat.vercel.app"
        title="smf-chat"
        style={{ width: "100%", height: "100%", border: "none", flex: 1 }}
        allow="clipboard-write"
      />
    </div>
  );
}
