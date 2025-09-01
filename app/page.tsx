import ChatBot from "@/components/ChatBot";

export default function YogaChatbot() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-between p-4">
      <ul className="list-disc list-inside max-w-xl">
        <li className="mb-4">
          <span className="text-sm size-1">
            For "Guide me through finding the best class for me", We can set it
            to ask questions that we set. Maybe ask for their availability and
            when they would like to start and at the end of the converation we
            can take them to punchpass to book the class that's best for them.
          </span>
        </li>
      </ul>
      <ChatBot />
      <div />
    </div>
  );
}
