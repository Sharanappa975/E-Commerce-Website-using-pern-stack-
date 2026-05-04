import { useEffect, useState } from "react";
import API from "../api/axios.config";

const CHAT_ASSISTANT_ENDPOINT = "/ai/chat";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    const handler = (event) => {
      const { message } = event.detail || {};
      if (!message) return;
      setChatMessages((prev) => [...prev, { role: "assistant", content: message }]);
    };
    window.addEventListener("ai:recommendations", handler);
    return () => window.removeEventListener("ai:recommendations", handler);
  }, []);

  const handleChatSend = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) {
      setChatError("Please enter a message.");
      return;
    }

    try {
      setChatError("");
      setIsChatLoading(true);
      const tempId = Date.now();
      const nextMessages = [
        ...chatMessages,
        { role: "user", content: trimmed },
        { role: "assistant", content: "Typing...", pending: true, id: tempId },
      ];
      setChatMessages(nextMessages);
      setChatInput("");

      const res = await API.post(CHAT_ASSISTANT_ENDPOINT, {
        message: trimmed,
        history: nextMessages,
      });

      const reply =
        res?.data?.reply ||
        res?.data?.message ||
        res?.data?.data?.reply ||
        "Thanks! I have noted your request.";

      setChatMessages((prev) =>
        prev.map((msg) => (msg.pending && msg.id === tempId ? { role: "assistant", content: reply } : msg))
      );
    } catch (err) {
      console.error(err);
      setChatError("We could not reach the chat assistant. Please try again.");
      setChatMessages((prev) =>
        prev.filter((msg) => !msg.pending)
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-80 sm:w-96 bg-white border shadow-xl rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
            <div>
              <p className="text-sm font-semibold">AI Chat Assistant</p>
              <p className="text-xs text-gray-300">Ask about products</p>
            </div>
            <button
              className="text-xs bg-gray-700 px-2 py-1 rounded"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="p-3 max-h-64 overflow-auto bg-gray-50">
            {chatMessages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet.</p>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className="mb-2">
                  <p className="text-xs text-gray-500 uppercase">{msg.role}</p>
                  <p className="text-sm">{msg.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask: Which laptop is best for coding?"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="border p-2 w-full rounded"
              />
              <button
                onClick={handleChatSend}
                disabled={isChatLoading}
                className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-60"
              >
                {isChatLoading ? "..." : "Send"}
              </button>
            </div>
            {chatError ? <p className="text-xs text-red-600 mt-2">{chatError}</p> : null}
          </div>
        </div>
      ) : null}

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 text-white px-4 py-3 rounded-full shadow-lg"
        >
          AI Chat
        </button>
      ) : null}
    </div>
  );
};

export default ChatWidget;
