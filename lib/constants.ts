import { Calendar, Clock, Heart, Sparkles } from "lucide-react";

export const quickActions = [
  { label: "Class Schedule", icon: Calendar },
  { label: "Beginner Classes", icon: Heart },
  { label: "Pricing", icon: Sparkles },
  { label: "Studio Location", icon: Clock },
];

export const suggestedQuestions = [
  "What classes are good for beginners?",
  "How much do your passes cost?",
  "Can I do yoga if I have an injury?",
  "Guide me through finding the best class for me",
];
export const IMPORTANT_INSTRUCTIONS = `IMPORTANT INSTRUCTIONS:
- When users ask about schedules, timetables, or booking classes, always direct them to our online PunchPass system at https://marrickvilleyoga.punchpass.com/calendar
- When users ask about location, address, or where the studio is, always provide the complete address: "53 Sydenham Rd, Marrickville NSW, Australia 2204"
- When users ask about pricing or passes, provide comprehensive information from the knowledge base
- When users ask about classes or what's available, give detailed information about our offerings
- Always be helpful, accurate, and provide complete information based on what you know
- If you don't have specific information, direct users to contact us at info@marrickvilleyoga.com.au`