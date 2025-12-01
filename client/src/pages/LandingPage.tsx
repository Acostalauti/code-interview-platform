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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-2xl text-center">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Code Interview Platform
                </h1>
                <p className="text-xl text-gray-300 mb-10">
                    Real-time collaborative coding interviews with safe in-browser execution.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="text-3xl mb-4">🤝</div>
                        <h3 className="text-lg font-semibold mb-2">Real-time Sync</h3>
                        <p className="text-gray-400 text-sm">Collaborate instantly with candidates.</p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="text-3xl mb-4">💻</div>
                        <h3 className="text-lg font-semibold mb-2">Multi-language</h3>
                        <p className="text-gray-400 text-sm">Support for JS, Python, and more.</p>
                    </div>
                    <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="text-3xl mb-4">🚀</div>
                        <h3 className="text-lg font-semibold mb-2">Safe Execution</h3>
                        <p className="text-gray-400 text-sm">Run code safely in the browser.</p>
                    </div>
                </div>

                <button
                    onClick={createSession}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
                >
                    Create New Interview
                </button>
            </div>
        </div>
    );
};

export default LandingPage;
