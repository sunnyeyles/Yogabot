# Yoga Chatbot

A modern, interactive chatbot for Marrickville Yoga Centre built with Next.js, React, and OpenAI. The chatbot provides information about yoga classes, schedules, pricing, and studio details while maintaining conversation history in Redis.

## Features

- **Intelligent Chat Interface**: Powered by OpenAI GPT-4o-mini for natural conversations
- **Persistent Chat History**: Conversations stored in Redis by IP address
- **Rate Limiting**: Built-in protection against spam and abuse
- **Responsive Design**: Modern UI with smooth animations and transitions
- **Knowledge Base Integration**: Comprehensive information about classes, pricing, and studio details
- **Real-time Messaging**: Instant responses with smooth UI interactions
- **Visual Enhancements**: Subtle fade effects and professional styling

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI**: OpenAI GPT-4o-mini
- **Database**: Redis for chat history storage
- **UI Components**: Radix UI components with custom styling
- **Markdown**: React Markdown for rich text rendering

## Getting Started

### Prerequisites

- Node.js 18+
- Redis server
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd yogabot2
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Rate Limiting (optional)
RATE_LIMIT_MAX_REQUESTS=150
RATE_LIMIT_WINDOW_MS=300000

# OpenAI API Rate Limiting (optional)
OPENAI_RATE_LIMIT_MAX_REQUESTS=150
OPENAI_RATE_LIMIT_WINDOW_MS=300000
```

4. Start Redis server:

```bash
# Using Docker (recommended)
docker run -d --name redis -p 6379:6379 redis:alpine

# Or using Homebrew (macOS)
brew install redis
brew services start redis
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
yogabot2/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Chat API endpoint
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   ├── ChatBot.tsx               # Main chat interface
│   └── ClientOnly.tsx            # Client-side only wrapper
├── data/
│   ├── json-data/                # Knowledge base JSON files
│   └── data-preview/             # Markdown preview files
├── hooks/
│   └── useChat.ts                # Chat state management
├── lib/
│   ├── chat.ts                   # Chat interface and types
│   ├── constants.ts              # App constants and instructions
│   ├── knowledge.ts              # Knowledge base management
│   ├── rateLimit.ts              # Rate limiting logic
│   ├── redis.ts                  # Redis client and functions
│   └── utils.ts                  # Utility functions
└── public/                       # Static assets
```

## Key Components

### ChatBot Component

The main chat interface featuring:

- Message display with markdown support
- Input handling and form submission
- Quick action buttons
- Suggested questions
- Visual fade effects

### useChat Hook

Manages chat state including:

- Message history
- Typing indicators
- Redis integration
- Auto-scrolling behavior
- Session management

### Redis Integration

Handles persistent storage:

- Chat history by IP address
- Automatic expiration (30 days)
- Message validation and sanitization
- Connection management

### Knowledge Base

Comprehensive yoga studio information:

- Class schedules and types
- Pricing and passes
- Studio location and contact details
- Frequently asked questions
- General studio information

## API Endpoints

### POST /api/chat

Handles chat messages:

- Processes user input
- Generates AI responses
- Stores messages in Redis
- Enforces rate limiting

### GET /api/chat

Retrieves chat history:

- Returns messages for current IP
- Handles error cases gracefully

### GET /api/admin/chats

Admin endpoint for monitoring:

- View all chat histories
- Clear chat data
- Debugging and maintenance

## Configuration

### Rate Limiting

- **User Rate Limiting**: Redis-based sliding window rate limiting

  - Default: 150 messages per 5 minutes per IP
  - Persistent across server restarts
  - Configurable via environment variables
  - Automatic rate limit headers

- **OpenAI API Rate Limiting**: Prevents hitting OpenAI's rate limits
  - Default: 150 API calls per 5 minutes (global)
  - Protects against excessive API usage and costs
  - Returns 503 status when limit exceeded
  - Configurable via environment variables

### Redis Settings

- Default connection: localhost:6379
- Chat expiration: 30 days
- Automatic reconnection handling

## Deployment

### Environment Variables

Ensure all required environment variables are set:

- `OPENAI_API_KEY`: Your OpenAI API key
- `REDIS_URL`: Redis connection string
- Optional rate limiting variables

## Development

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling

## Features in Detail

### Chat Interface

- Real-time message display
- Markdown rendering for rich text
- Timestamp display with client-side rendering
- Smooth scrolling to latest messages
- Visual fade effects for better UX

### Message Storage

- IP-based conversation tracking
- Automatic message expiration
- Error handling and fallbacks
- Data validation and sanitization

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**

   - Ensure Redis server is running
   - Check REDIS_URL environment variable
   - Verify network connectivity

2. **OpenAI API Errors**

   - Verify OPENAI_API_KEY is set correctly
   - Check API key permissions and billing
   - Monitor rate limits

3. **Chat History Not Loading**
   - Check Redis connection
   - Verify message storage functions
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```
