import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const chatEndRef = useRef(null);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // 🔄 Scroll automático al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const res = await axios.post("http://localhost:3000/chat", { message: input });
      const botMsg = { sender: "bot", text: res.data.respuesta };
      setMessages((prev) => [...prev, botMsg]);

      // 🔊 Leer respuesta en voz
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(res.data.respuesta);
      utter.lang = "es-CO";
      synth.speak(utter);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error al conectar con el servidor." },
      ]);
    }
  };

  const startListening = () => {
    if (!recognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    recognition.lang = "es-CO";
    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      alert("No se pudo reconocer tu voz.");
    };
  };

  // 🎨 Estilos dinámicos según modo accesible
  const themeClasses = accessibleMode
    ? "bg-gray-900 text-white"
    : "bg-white text-gray-900";

  const textSize = accessibleMode ? "text-lg" : "text-base";

  return (
    <div
      className={`w-full max-w-md ${themeClasses} rounded-2xl shadow-lg p-4 mt-6 flex flex-col justify-between h-[75vh] transition-all duration-500`}
    >
      {/* 🔘 Botón de accesibilidad */}
      <button
        onClick={() => setAccessibleMode(!accessibleMode)}
        className="self-end mb-2 px-3 py-1 text-sm bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition"
      >
        {accessibleMode ? "Modo normal" : "Modo accesible"}
      </button>

      {/* 💬 Ventana de chat */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-xl max-w-[80%] ${textSize} ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-300 text-gray-800 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* 🧭 Zona de entrada */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          placeholder="Habla o escribe tu pregunta..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 ${textSize}`}
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Enviar
        </button>

        {/* 🎤 Micrófono animado */}
        <button
          onClick={startListening}
          className={`flex items-center justify-center text-white px-3 py-2 rounded-lg transition-all ${
            listening
              ? "bg-red-500 animate-pulse"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          🎤
        </button>
      </div>
    </div>
  );
}
