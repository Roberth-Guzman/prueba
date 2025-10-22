import Chat from "./components/Chat";

export default function App() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="mt-8 text-3xl font-bold text-blue-900">
        💊 Asistente de Farmacia – Sally
      </h1>
      <Chat />
    </div>
  );
}
