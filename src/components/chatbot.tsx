"use client"; // Required for interactivity
import { useState } from "react";

export default function Chatbot() {
  const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Toggle visibility

  const sendMessage = async () => {
    if (!input) return;

    // Add user message
    setMessages([...messages, { sender: "You", text: input }]);
    setInput("");

    // Call backend API (Step 2)
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await response.json();
    setMessages((msgs) => [...msgs, { sender: "Bot", text: data.reply }]);
  };

  return (
    <>
      {/* Toggle button (fixed at bottom-right corner) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-800"
      >
        {isOpen ? "×" : "💬"}
      </button>

      {/* Chat UI (shown only when isOpen=true) */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col">
          <div className="p-4 bg-blue-500 text-white rounded-t-lg">
            <h2 className="font-bold">AI Assistant</h2>
          </div>
          <div className="p-4 h-60 overflow-y-auto">
            {messages.map((msg, i) => (
              <p key={i} className="mb-2">
                <strong>{msg.sender}:</strong> {msg.text}
              </p>
            ))}
          </div>
          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question..."
              className="flex-1 p-2 border rounded"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
             <button
              onClick={sendMessage}
              className="group p-2 bg-blue-500 text-white rounded hover:bg-blue-800 transition-all"
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
