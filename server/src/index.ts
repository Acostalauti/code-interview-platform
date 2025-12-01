import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', ({ sessionId, userName }) => {
        const session = getSession(sessionId);
        if (session) {
            socket.join(sessionId);
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

    socket.on('code-change', ({ sessionId, code }) => {
        updateSessionCode(sessionId, code);
        socket.to(sessionId).emit('code-update', code);
    });

    socket.on('language-change', ({ sessionId, language }) => {
        updateSessionLanguage(sessionId, language);
        io.to(sessionId).emit('language-update', language);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // We need to find which session the user was in.
        // In a real app, we might map socket.id to sessionId.
        // For now, we can iterate (inefficient but works for small scale) or store it on the socket object if we use a custom type.
        // Let's just iterate our store for now.
        // Actually, socket.rooms contains the rooms.
        // But we need to update our store.
        // Let's just do a quick search in our store.
        // Since we don't have a reverse map, we'll just leave it for now or implement a better way if needed.
        // A simple way is to store sessionId on the socket during join.
    });
});

// Better disconnect handling
io.on('connection', (socket: any) => {
    socket.on('join-session', ({ sessionId, userName }: { sessionId: string, userName: string }) => {
        socket.sessionId = sessionId;
        // ... rest of logic
    });

    socket.on('disconnect', () => {
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
