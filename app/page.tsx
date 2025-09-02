import ChatBot from "@/components/ChatBot";

export default function YogaChatbot() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-between p-4">
      <ul className="list-disc list-inside max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <li className="mb-4">
          <span className="text-sm size-1">
            <span className="text-sm size-1">
              Yogabot is a 24/7 digital receptionist + sales assistant
            </span>
          </span>
        </li>
        <li className="mb-4">
          <span className="text-sm size-1">
            For “Guide me to the best class”, the bot can ask 3–4 quick
            questions (e.g., availability, start date) to recommend the right
            option whether that is online or in person. At the end, it sends
            users directly to the booking page in Punchpass. This reduces
            friction and increases conversions — especially for people who are
            undecided. In this way, the bot acts not just as support, but as a
            sales assistant.
          </span>
        </li>

        <li className="mb-4">
          <span className="text-sm size-1">
            We can pull all the data from emails to make sure the bot answers
            the questions that come up often exactly as you would like them to
            be answered.
          </span>
        </li>
        <li className="mb-4">
          <span className="text-sm size-1">
            We can pull all the data from emails to make sure the bot answers
            the questions that come up often exactly as you would like them to
            be answered.
          </span>
        </li>
        <li className="mb-4">
          <span className="text-sm size-1">
            The chat window has very subtle animations to draw the users
            attention.
          </span>
        </li>
        <li className="mb-4">
          <span className="text-sm size-1">
            We could even pull upcoming classes data from punchpass to show the
            upcoming classes in our own calendar.
          </span>
        </li>
      </ul>
      <ChatBot />
      <div />
    </div>
  );
}
