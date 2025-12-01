import React, { useState } from 'react';

interface JoinModalProps {
    onJoin: (name: string) => void;
}

const JoinModal: React.FC<JoinModalProps> = ({ onJoin }) => {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onJoin(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-white text-center">Join Session</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Enter your name..."
                            autoFocus
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors mt-2"
                    >
                        Join
                    </button>
                </form>
            </div>
        </div>
    );
};

export default JoinModal;
