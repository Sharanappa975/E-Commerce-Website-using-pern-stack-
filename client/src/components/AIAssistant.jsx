import { FaRobot } from "react-icons/fa";

export default function AIAssistant() {
  return (
    <div
      className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg cursor-pointer"
    >
      <FaRobot size={24} />
    </div>
  );
}