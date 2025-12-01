import React from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string | undefined) => void;
    onMount?: OnMount;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, onMount }) => {
    return (
        <div className="h-full w-full overflow-hidden border border-gray-700 shadow-inner">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                onMount={onMount}
                options={{
                    // Basic settings
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, 'Courier New', monospace",
                    fontLigatures: true,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,

                    // IntelliSense and autocomplete
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: true,
                    },
                    parameterHints: { enabled: true },
                    acceptSuggestionOnEnter: 'on',
                    tabCompletion: 'on',

                    // Bracket handling
                    autoClosingBrackets: 'always',
                    autoClosingQuotes: 'always',
                    matchBrackets: 'always',
                    bracketPairColorization: { enabled: true },

                    // Code formatting
                    formatOnPaste: true,
                    formatOnType: true,

                    // Code folding
                    folding: true,
                    foldingStrategy: 'indentation',
                    showFoldingControls: 'always',

                    // Better readability
                    lineHeight: 22,
                    renderLineHighlight: 'all',
                    renderWhitespace: 'selection',
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,

                    // Additional helpful features
                    contextmenu: true,
                    mouseWheelZoom: true,
                    links: true,
                    colorDecorators: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
