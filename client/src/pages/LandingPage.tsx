import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const createSession = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/sessions', {
                method: 'POST',
            });
            const data = await response.json();
            navigate(`/session/${data.sessionId}`);
        } catch (error) {
            console.error('Failed to create session:', error);
            alert('Failed to create session. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-screen px-12 py-12">
                <div className="w-full text-center">
                    <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Code Interview Platform
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-16">
                        Real-time collaborative coding interviews with safe in-browser execution.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
                        <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1">
                            <div className="text-5xl mb-4">🤝</div>
                            <h3 className="text-xl font-semibold mb-3 text-blue-400">Real-time Sync</h3>
                            <p className="text-gray-400">Collaborate instantly with candidates.</p>
                        </div>
                        <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1">
                            <div className="text-5xl mb-4">💻</div>
                            <h3 className="text-xl font-semibold mb-3 text-purple-400">Multi-language</h3>
                            <p className="text-gray-400">Support for JS, Python, and more.</p>
                        </div>
                        <div className="p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-pink-500 transition-all hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-1">
                            <div className="text-5xl mb-4">🚀</div>
                            <h3 className="text-xl font-semibold mb-3 text-pink-400">Safe Execution</h3>
                            <p className="text-gray-400">Run code safely in the browser.</p>
                        </div>
                    </div>

                    <button
                        onClick={createSession}
                        className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50"
                    >
                        Create New Interview
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
