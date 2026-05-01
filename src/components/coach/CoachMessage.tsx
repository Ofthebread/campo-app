import type { CoachMessage as CoachMessageType } from "@/types/user";

interface Props {
  message: CoachMessageType;
}

export default function CoachMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary-600 text-white rounded-br-sm"
            : "bg-slate-100 text-slate-800 rounded-bl-sm"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
