import VoiceAssistant from "@/components/VoiceAssistant";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Maltasells AI Voice Assistant Test
        </h1>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <VoiceAssistant />
        </div>
      </div>
    </div>
  );
}