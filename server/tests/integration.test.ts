import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket } from 'socket.io-client';
import { server, io } from '../src/index';

describe('Code Interview Platform Integration Tests', () => {
    let clientSocket: Socket;
    let clientSocket2: Socket;
    let httpServer: any;
    let port: number;

    beforeAll((done) => {
        // Start server on a random port
        httpServer = server.listen(() => {
            port = (httpServer.address() as AddressInfo).port;
            done();
        });
    });

    afterAll((done) => {
        io.close();
        httpServer.close();
        done();
    });

    beforeEach((done) => {
        // Setup clients
        clientSocket = Client(`http://localhost:${port}`);
        clientSocket2 = Client(`http://localhost:${port}`);

        let connectedCount = 0;
        const checkConnected = () => {
            connectedCount++;
            if (connectedCount === 2) done();
        };

        clientSocket.on('connect', checkConnected);
        clientSocket2.on('connect', checkConnected);
    });

    afterEach(() => {
        if (clientSocket.connected) clientSocket.disconnect();
        if (clientSocket2.connected) clientSocket2.disconnect();
    });

    test('should allow users to join a session', (done) => {
        const sessionId = 'test-session-1';
        const userName = 'User1';

        // We need to create the session first via API or mock it.
        // Since our server uses in-memory store and exposes createSession via API, 
        // let's just use the fact that our socket logic checks getSession.
        // Wait, the current implementation requires the session to exist in the store.
        // We can import the store functions to seed data or use the API.
        // Let's import the store functions for easier testing without making HTTP requests.
        const { createSession } = require('../src/sessionStore');
        createSession(sessionId);

        clientSocket.emit('join-session', { sessionId, userName });

        clientSocket.on('init-session', (session: any) => {
            expect(session.id).toBe(sessionId);
            expect(session.users).toHaveLength(1);
            expect(session.users[0].name).toBe(userName);
            done();
        });
    });

    test('should sync code changes between users', (done) => {
        const sessionId = 'test-session-2';
        const { createSession } = require('../src/sessionStore');
        createSession(sessionId);

        // Join both users
        clientSocket.emit('join-session', { sessionId, userName: 'User1' });
        clientSocket2.emit('join-session', { sessionId, userName: 'User2' });

        // Wait for both to join (simplification)
        setTimeout(() => {
            const newCode = 'console.log("Hello World");';

            clientSocket2.on('code-update', (code: string) => {
                expect(code).toBe(newCode);
                done();
            });

            clientSocket.emit('code-change', { sessionId, code: newCode });
        }, 100);
    });

    test('should sync language changes', (done) => {
        const sessionId = 'test-session-3';
        const { createSession } = require('../src/sessionStore');
        createSession(sessionId);

        clientSocket.emit('join-session', { sessionId, userName: 'User1' });
        clientSocket2.emit('join-session', { sessionId, userName: 'User2' });

        setTimeout(() => {
            const newLang = 'python';

            clientSocket2.on('language-update', (lang: string) => {
                expect(lang).toBe(newLang);
                done();
            });

            clientSocket.emit('language-change', { sessionId, language: newLang });
        }, 100);
    });
});
