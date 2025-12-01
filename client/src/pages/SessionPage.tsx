import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import CodeEditor from '../components/CodeEditor';
import JoinModal from '../components/JoinModal';

interface User {
    id: string;
    name: string;
}

const SessionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [joined, setJoined] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [code, setCode] = useState('// Loading...');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    // Ref to avoid infinite loops with socket updates
    const isRemoteUpdate = useRef(false);

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !joined) return;

        socket.on('init-session', (session) => {
            isRemoteUpdate.current = true;
            setCode(session.code);
            setLanguage(session.language);
            setUsers(session.users);
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        socket.on('code-update', (newCode) => {
            isRemoteUpdate.current = true;
            setCode(newCode);
            // Small timeout to allow render to complete before resetting flag
            // In a real app, we might use CRDTs or operational transformation
            setTimeout(() => { isRemoteUpdate.current = false; }, 100);
        });

        socket.on('language-update', (newLang) => {
            setLanguage(newLang);
        });

        socket.on('user-joined', (user) => {
            // Handled by users-update usually, but good for notifications
            console.log('User joined:', user);
        });

        socket.on('user-left', (userId) => {
            console.log('User left:', userId);
        });

        socket.on('users-update', (updatedUsers) => {
            setUsers(updatedUsers);
        });

        return () => {
            socket.off('init-session');
            socket.off('code-update');
            socket.off('language-update');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('users-update');
        };
    }, [socket, joined]);

    const handleJoin = (name: string) => {
        if (socket && id) {
            socket.emit('join-session', { sessionId: id, userName: name });
            setJoined(true);
        }
    };

    const handleCodeChange = (value: string | undefined) => {
        if (value !== undefined) {
            setCode(value);
            if (!isRemoteUpdate.current && socket && id) {
                socket.emit('code-change', { sessionId: id, code: value });
            }
        }
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        if (socket && id) {
            socket.emit('language-change', { sessionId: id, language: newLang });
        }
    };

    const runCode = async () => {
        setIsRunning(true);
        setOutput([]); // Clear previous output

        try {
            // Show loading message for Python first-time execution
            if (language === 'python') {
                setOutput(['🔄 Initializing Python runtime...']);
            }

            const { executeCode } = await import('../utils/codeExecutor');
            const result = await executeCode(code, language as 'javascript' | 'python');


            const output = result.output || [];

            if (result.error) {
                output.push('');
                output.push(`❌ ${result.error}`);
            }

            // Add execution time
            if (result.executionTime !== undefined) {
                output.push('');
                output.push(`⏱️  Execution time: ${result.executionTime.toFixed(2)}ms`);
            }

            setOutput(output.length > 0 ? output : ['✅ Code executed successfully (no output)']);
        } catch (err: any) {
            setOutput([`💥 Fatal error: ${err.message}`]);
        } finally {
            setIsRunning(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (!joined) {
        return <JoinModal onJoin={handleJoin} />;
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Toolbar */}
                <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Session
                        </h1>
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className={`px-4 py-2 rounded font-bold text-sm flex items-center gap-2 transition-colors ${isRunning ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                                }`}
                        >
                            {isRunning ? 'Running...' : '▶ Run Code'}
                        </button>
                        <button
                            onClick={copyLink}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-sm transition-colors"
                        >
                            Copy Link
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 p-4 pb-0 min-h-0">
                    <CodeEditor
                        code={code}
                        language={language === 'cpp' ? 'cpp' : language} // Monaco uses 'cpp' for C++
                        onChange={handleCodeChange}
                    />
                </div>

                {/* Output Panel */}
                <div className="h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
                    <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto">
                        {output.length > 0 ? (
                            output.map((line, i) => (
                                <div key={i} className="mb-1 text-gray-300 border-b border-gray-800 pb-1 last:border-0">
                                    {line}
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-600 italic">Run code to see output...</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="font-bold text-gray-300 mb-1">Participants</h2>
                    <div className="text-xs text-gray-500">{users.length} connected</div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div className="flex flex-col gap-3">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-sm truncate">{user.name}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionPage;
