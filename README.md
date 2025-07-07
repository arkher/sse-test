# SSE Chat Server with AI Integration

This SSE (Server-Sent Events) server provides real-time chat functionality with artificial intelligence integration using the OpenAI API.

## Features

- ✅ Real-time chat using Server-Sent Events
- ✅ OpenAI GPT integration for intelligent responses
- ✅ Conversation history maintained on server
- ✅ Contextual responses based on conversation history
- ✅ Flexible configuration via environment variables
- ✅ Endpoints for managing conversation history

## Setup

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure OpenAI API Key

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key at https://platform.openai.com/api-keys
3. Edit the `.env` file and replace `your_openai_api_key_here` with your API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
AI_SYSTEM_PROMPT=You are a helpful medical assistant. Respond to patient questions in a professional, caring, and informative manner. Keep responses concise but helpful.
```

### 3. Run the server

```bash
yarn start
```

The server will be available at `http://localhost:3000`

## API Endpoints

### SSE Connection
- **GET** `/api/events` - Connect to SSE event stream

### Send Message
- **POST** `/api/events`
  ```json
  {
    "message": "Your message here",
    "to": "all"
  }
  ```

### Manage History
- **GET** `/api/history` - Get conversation history
- **POST** `/api/clear-history` - Clear conversation history

## How It Works

1. **SSE Connection**: Client connects via GET `/api/events`
2. **Send Message**: Client sends message via POST `/api/events`
3. **AI Processing**: Server generates response using OpenAI
4. **Response**: AI responds via SSE with conversation context

## Advanced Configuration

### AI Model
You can change the model in the `.env` file:
```env
OPENAI_MODEL=gpt-4
```

### System Prompt
Customize AI behavior:
```env
AI_SYSTEM_PROMPT=You are a friendly customer service representative...
```

### AI Parameters
In the `src/aiService.ts` file, you can adjust:
- `max_tokens`: Token limit per response (default: 300)
- `temperature`: Response creativity (0.0-1.0, default: 0.7)
- History: Last 10 messages kept for context

## Project Structure

```
sse-test/
├── src/
│   ├── index.ts          # Main server
│   └── aiService.ts      # AI service
├── public/               # Static files
├── .env                  # Configuration
└── package.json
```

## Troubleshooting

### "API key not configured"
- Check if the `.env` file exists
- Confirm the API key is correct
- Restart the server after changes

### "Rate limit exceeded"
- OpenAI API has usage limits
- Consider using a cheaper model (gpt-3.5-turbo)

### SSE connection lost
- Server reconnects automatically
- Check server logs for errors

## Development

### Logs
The server displays detailed logs:
- Client connections/disconnections
- Received messages
- AI API errors
- Configuration status

### Manual Testing
```bash
# Test sending a message
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI!","to":"all"}'
```

## Security

⚠️ **Important**: 
- Never commit your API key to Git
- The `.env` file is already in `.gitignore`
- Use HTTPS in production
- Consider rate limiting to prevent abuse

## Next Steps

- [ ] Add authentication
- [ ] Implement rate limiting
- [ ] Support for multiple chat rooms
- [ ] Database integration
- [ ] Web interface for administration