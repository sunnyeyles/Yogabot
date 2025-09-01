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
            For "Guide me through finding the best class for me", We can set it
            to ask questions of our choosing. Maybe 3-4 questions so the user
            doesn't lost interest. Maybe ask for their availability and when
            they would like to start. At the end of the converation we can take
            them to the right page on punchpass to book the class we reccomended
            them in the chat. This should boost the conversion rate by removing
            friction from the booking process, especially for people who were
            not sure if they wanted to book or not are more likely to just pull
            the trigger when they are taken directly to the booking page. The
            bot is not only customer service but also a sales person.
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
