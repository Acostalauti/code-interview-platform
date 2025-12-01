import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import {
    createSession,
    getSession,
    addUserToSession,
    removeUserFromSession,
    updateSessionCode,
    updateSessionLanguage,
} from './sessionStore';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for simplicity in this demo
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/sessions', (req, res) => {
    const sessionId = uuidv4();
    const session = createSession(sessionId);
    res.json({ sessionId });
});

app.get('/api/sessions/:id', (req, res) => {
    const session = getSession(req.params.id);
    if (session) {
        res.json(session);
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Socket.io Logic
io.on('connection', (socket: any) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', ({ sessionId, userName }: { sessionId: string; userName: string }) => {
        const session = getSession(sessionId);
        if (session) {
            socket.join(sessionId);
            socket.sessionId = sessionId; // Track session for disconnect handling
            addUserToSession(sessionId, { id: socket.id, name: userName });

            // Send initial state to the user
            socket.emit('init-session', session);

            // Notify others
            io.to(sessionId).emit('user-joined', { id: socket.id, name: userName });
            io.to(sessionId).emit('users-update', session.users);
        } else {
            socket.emit('error', 'Session not found');
        }
    });

    socket.on('code-change', ({ sessionId, code }: { sessionId: string; code: string }) => {
        updateSessionCode(sessionId, code);
        socket.to(sessionId).emit('code-update', code);
    });

    socket.on('language-change', ({ sessionId, language }: { sessionId: string; language: string }) => {
        updateSessionLanguage(sessionId, language);
        io.to(sessionId).emit('language-update', language);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.sessionId) {
            removeUserFromSession(socket.sessionId, socket.id);
            io.to(socket.sessionId).emit('user-left', socket.id);
            const session = getSession(socket.sessionId);
            if (session) {
                io.to(socket.sessionId).emit('users-update', session.users);
            }
        }
    });
});

// Export for testing
export { server, io, app };

const PORT = process.env.PORT || 3000;

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
