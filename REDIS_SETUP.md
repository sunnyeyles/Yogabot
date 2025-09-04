# Redis Setup for Chat Storage

This application now stores chat conversations in Redis, organized by IP address.

## Environment Variables

Add the following to your `.env.local` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379
```

## Redis Installation

### Local Development

1. **Using Docker (Recommended):**

   ```bash
   docker run -d --name redis -p 6379:6379 redis:alpine
   ```

2. **Using Homebrew (macOS):**

   ```bash
   brew install redis
   brew services start redis
   ```

3. **Using apt (Ubuntu/Debian):**
   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   ```

## Features

- **IP-based Storage**: Chat messages are stored by client IP address
- **Automatic Expiration**: Chat history expires after 30 days
- **Persistent Storage**: Messages persist across sessions and browser restarts
- **Rate Limiting**: Built-in rate limiting per IP address

## Data Structure

Chat messages are stored in Redis using the key pattern: `chat:{ip_address}`

Each message contains:

- `id`: Unique message identifier
- `content`: Message text
- `sender`: Either "user" or "bot"
- `timestamp`: ISO timestamp

## API Endpoints

- `POST /api/chat`: Send a message and store in Redis
- `GET /api/chat`: Retrieve chat history for the current IP

## Troubleshooting

1. **Connection Issues**: Ensure Redis is running and accessible
2. **IP Detection**: Check that your reverse proxy/load balancer forwards the correct IP headers
3. **Memory Usage**: Monitor Redis memory usage and adjust expiration settings if needed
