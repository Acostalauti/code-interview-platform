# Code Interview Platform

A real-time collaborative coding interview platform with safe in-browser code execution.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue)
![Backend](https://img.shields.io/badge/Express-Socket.io-green)
![Tests](https://img.shields.io/badge/Tests-Passing-success)

## Features

- 🤝 **Real-time Collaboration**: Multiple users can edit code simultaneously with instant synchronization
- 💻 **Multi-language Support**: Syntax highlighting for JavaScript, Python, Java, and C++
- 🚀 **Safe Code Execution**: Run JavaScript code safely in the browser using Web Workers
- 🎨 **Modern UI**: Clean, responsive interface built with React and TailwindCSS
- 👥 **Participant Management**: See who's connected to the session
- 🔗 **Easy Sharing**: One-click session link copying

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Monaco Editor** for code editing
- **Socket.io Client** for real-time communication

### Backend
- **Express.js** with TypeScript
- **Socket.io** for WebSocket connections
- **In-memory session storage** (no database required for v1)

## Project Structure

```
code-interview-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components (CodeEditor, JoinModal)
│   │   ├── pages/         # Page components (LandingPage, SessionPage)
│   │   ├── App.tsx        # Main app with routing
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # Backend Express application
│   ├── src/
│   │   ├── index.ts       # Server entry point with Socket.io
│   │   └── sessionStore.ts # In-memory session management
│   ├── tests/
│   │   └── integration.test.ts  # Integration tests
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd code-interview-platform
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

**OR** install all dependencies at once from the root:
```bash
npm run install:all
```

### Quick Start

Once dependencies are installed, run from the root directory:

```bash
npm run dev
```

This will start both the server and client. Open your browser to `http://localhost:5173` and start coding!


## Development

### Running the Application

#### Option 1: Run Both Server and Client with One Command (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the server and client concurrently. The server will run on `http://localhost:3000` and the client on `http://localhost:5173`.

#### Option 2: Run Server and Client Separately

If you prefer to run them in separate terminals:

**Terminal 1: Start the Server**
```bash
npm run dev:server
# or: cd server && npm run dev
```

**Terminal 2: Start the Client**
```bash
npm run dev:client
# or: cd client && npm run dev
```

### Other Useful Commands

**Install all dependencies (root, server, and client):**
```bash
npm run install:all
```

**Run tests:**
```bash
npm test
```


### Using the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Click **"Create New Interview"** to create a new session
3. Copy the session link and share it with participants
4. Participants will be prompted to enter their display name
5. Start coding together in real-time!

### Running Code

1. Select a language from the dropdown (currently only JavaScript execution is supported)
2. Write your code in the editor
3. Click **"Run Code"** to execute JavaScript code safely in the browser
4. View the output in the console panel below the editor

## Testing

### Server Integration Tests

The server includes integration tests for Socket.io functionality.

```bash
cd server
npm test
```

**Test Coverage:**
- ✅ User session joining
- ✅ Real-time code synchronization
- ✅ Language preference synchronization

## Building for Production

### Build the Server
```bash
cd server
npm run build
npm start
```

### Build the Client
```bash
cd client
npm run build
npm run preview
```

## API Documentation

This platform provides both REST and WebSocket APIs for session management and real-time collaboration.

### REST API

Complete REST API documentation is available in [OpenAPI 3.0 format](openapi.yaml).

#### Quick Reference

- `POST /api/sessions` - Create a new session
  - Response: `{ sessionId: string }`

- `GET /api/sessions/:id` - Get session details
  - Response: `{ id, code, language, users[] }`

You can view and interact with the API documentation using tools like [Swagger Editor](https://editor.swagger.io/) or [Stoplight](https://stoplight.io/).

### WebSocket Events (Socket.IO)

Complete WebSocket API documentation is available in [AsyncAPI 2.6 format](asyncapi.yaml).

#### Client → Server Events

- `join-session` - Join a coding session
  - Payload: `{ sessionId: string, userName: string }`
- `code-change` - Broadcast code changes
  - Payload: `{ sessionId: string, code: string }`
- `language-change` - Change programming language
  - Payload: `{ sessionId: string, language: string }`

#### Server → Client Events

- `init-session` - Initial session state after joining
  - Payload: `Session` object
- `code-update` - Code changed by another user
  - Payload: `string` (new code)
- `language-update` - Language changed by another user
  - Payload: `string` (new language)
- `user-joined` - New user joined the session
  - Payload: `User` object
- `user-left` - User disconnected
  - Payload: `string` (user socket ID)
- `users-update` - Updated participant list
  - Payload: `User[]` array
- `error` - Error notification
  - Payload: `string` (error message)

You can visualize the WebSocket API using [AsyncAPI Studio](https://studio.asyncapi.com/).

## Architecture

### Real-time Synchronization
The platform uses Socket.io for bidirectional communication between clients and server. When a user types in the editor, changes are:
1. Sent to the server via WebSocket
2. Broadcast to all other connected users in the same session
3. Applied to their editors in real-time

### Code Execution
JavaScript code is executed safely using Web Workers, which run in a separate thread isolated from the main application. This prevents:
- Blocking the UI during execution
- Access to sensitive browser APIs
- Interference with the application state

## Known Limitations

- **Code Execution**: Only JavaScript is executed in the browser. Python, Java, and C++ have syntax highlighting but no execution support yet.
- **Session Persistence**: Sessions are stored in memory and will be lost on server restart.
- **Authentication**: No user authentication or authorization in v1.
- **Scalability**: In-memory storage is not suitable for production scale.

## Future Enhancements

- [ ] Add backend code execution service for Python, Java, C++
- [ ] Implement session persistence with a database
- [ ] Add user authentication and authorization
- [ ] Add chat functionality
- [ ] Implement cursor position sharing
- [ ] Add code history/versioning
- [ ] Support for multiple files/tabs
- [ ] Add video/audio calling integration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using React, Express, and Socket.io
