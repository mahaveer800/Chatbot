import { useState, useRef, useEffect } from "react";
import { Plus, Menu, X } from "lucide-react";
import { API_KEY, API_URL } from "./data";

function App() {
  const [questions, setQuestions] = useState("");
  const [messages, setMessages] = useState([]);
  const [searches, setSearches] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatContainerRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const askQuestion = async () => {
    if (!questions.trim()) return;

    const userMessage = { sender: "user", type: "text", text: questions };
    setMessages((prev) => [...prev, userMessage]);
    setSearches((prev) => [...prev, questions]);

    const payload = { contents: [{ parts: [{ text: questions }] }] };

    try {
      const res = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      let answerText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "😕 No response received";

      const botMessage = { sender: "bot", type: "text", text: answerText };
      setMessages((prev) => [...prev, botMessage]);
      setQuestions("");
    } catch (error) {
      const botMessage = {
        sender: "bot",
        type: "text",
        text: "❌ Error: " + error.message,
      };
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  // Handle image upload
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setMessages((prev) => [
        ...prev,
        { sender: "user", type: "image", url: imageUrl },
      ]);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            type: "text",
            text: "🤖 I received your image. What do you want to ask about it?",
          },
        ]);
      }, 1000);
    }
  };

  // Delete recent search
  const deleteSearch = (index) => {
    setSearches((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed mt-4 pt-2 left-1 h-[95vh] bg-zinc-800 z-50 w-48 transform rounded md:translate-x-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <div className="flex items-center justify-between md:hidden">
          <h2 className="flex text-center text-xl font-bold text-white">
            Recent Searches
          </h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-white" />
          </button>
        </div>

        <ul className="mt-4 md:mt-0 space-y-2 px-2 overflow-y-auto h-full">
          {searches.length === 0 && (
            <p className="text-gray-100 text-sm mt-4 ml-8">No searches</p>
          )}
          {searches.map((q, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-zinc-700 px-2 py-1 rounded-lg text-white"
            >
              <span className="truncate max-w-[140px]" title={q}>{q}</span>
              <button onClick={() => deleteSearch(index)} className="ml-2">❌</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat box */}
      <div className="flex-1 flex flex-col md:ml-32">
        <div className="md:hidden flex items-center p-8 bg-zinc-800 text-2xl">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={28} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white ml-4">Chatbot</h1>
        </div>

        <h1 className="hidden md:block text-center w-full mt-2 text-2xl bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
          Hello User, Ask me Anything
        </h1>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 max-w-[90%] mt-2 md:mt-4 mx-4 mb-6 md:mx-20 p-4 bg-zinc-900 rounded-lg shadow overflow-y-auto scrollbar-hide text-white"
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`my-2 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "text" ? (
                <div
                  className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-zinc-700 text-white rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              ) : (
                <img
                  src={msg.url}
                  alt="uploaded"
                  className="max-w-[150px] md:max-w-[200px] rounded-2xl shadow"
                />
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-zinc-700 mb-12 sm:mb-14 text-white mx-auto rounded-full border-2 border-zinc-500 flex items-center px-2 gap-2 lg:w-[40rem] min-h-[3rem] sm:min-h-[2.5rem]">
  {/* File input */}
  <input
    type="file"
    accept="image/*"
    id="fileInput"
    onChange={handleImage}
    className="hidden"
  />
  <label
    htmlFor="fileInput"
    className="cursor-pointer p-2  rounded-full flex items-center justify-center"
  >
    <Plus size={20} />
  </label>

  {/* Text input */}
  <input
    type="text"
    value={questions}
    onChange={(e) => setQuestions(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && askQuestion()}
    placeholder="Ask me anything"
    className="flex-1 bg-zinc-700 outline-none px-2 py-2 text-md md:text-base rounded-full"
  />

  {/* Button */}
  <button
    onClick={askQuestion}
    className="px-4 py-2 text-lg rounded-full  hover:bg-gray-500 transition"
  >
    Ask
  </button>
</div>

      </div>
    </div>
  );
}

export default App;
