import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
    code: string;
    language: string;
    onChange: (value: string | undefined) => void;
    onMount?: OnMount;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, onMount }) => {
    return (
        <div className="h-full w-full overflow-hidden rounded-lg border border-gray-700 shadow-inner">
            <Editor
                height="100%"
                language={language}
                value={code}
                theme="vs-dark"
                onChange={onChange}
                onMount={onMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                }}
            />
        </div>
    );
};

export default CodeEditor;
