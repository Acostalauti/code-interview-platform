export interface Session {
    id: string;
    code: string;
    language: string;
    users: User[];
}

export interface User {
    id: string;
    name: string;
}

const sessions: Map<string, Session> = new Map();

export const createSession = (id: string): Session => {
    const session: Session = {
        id,
        code: '// Start coding...',
        language: 'javascript',
        users: [],
    };
    sessions.set(id, session);
    return session;
};

export const getSession = (id: string): Session | undefined => {
    return sessions.get(id);
};

export const addUserToSession = (sessionId: string, user: User) => {
    const session = sessions.get(sessionId);
    if (session) {
        // Avoid duplicates
        if (!session.users.find((u) => u.id === user.id)) {
            session.users.push(user);
        }
    }
};

export const removeUserFromSession = (sessionId: string, userId: string) => {
    const session = sessions.get(sessionId);
    if (session) {
        session.users = session.users.filter((u) => u.id !== userId);
    }
};

export const updateSessionCode = (sessionId: string, code: string) => {
    const session = sessions.get(sessionId);
    if (session) {
        session.code = code;
    }
};

export const updateSessionLanguage = (sessionId: string, language: string) => {
    const session = sessions.get(sessionId);
    if (session) {
        session.language = language;
    }
};
