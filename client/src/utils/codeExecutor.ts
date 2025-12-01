/**
 * Code Executor Utility
 * 
 * Provides secure, sandboxed code execution for JavaScript and Python
 * using Web Workers and Pyodide (WASM) respectively.
 */

import { loadPyodide, type PyodideInterface } from 'pyodide';

export interface ExecutionResult {
    output: string[];
    error?: string;
    executionTime?: number;
}

// Cache Pyodide instance to avoid reloading
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

/**
 * Load Pyodide runtime (lazy loading)
 */
async function getPyodide(): Promise<PyodideInterface> {
    if (pyodideInstance) {
        return pyodideInstance;
    }

    if (pyodideLoading) {
        return pyodideLoading;
    }

    pyodideLoading = loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
    });

    pyodideInstance = await pyodideLoading;
    pyodideLoading = null;
    return pyodideInstance;
}

/**
 * Execute JavaScript code in a Web Worker
 */
async function executeJavaScript(code: string): Promise<ExecutionResult> {
    return new Promise((resolve) => {
        const workerCode = `
            let timeoutId;
            
            self.onmessage = function(e) {
                const { code, timeout } = e.data;
                const logs = [];
                
                // Override console methods
                const originalLog = console.log;
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.log = function(...args) {
                    logs.push(args.map(a => String(a)).join(' '));
                };
                
                console.error = function(...args) {
                    logs.push('❌ ' + args.map(a => String(a)).join(' '));
                };
                
                console.warn = function(...args) {
                    logs.push('⚠️ ' + args.map(a => String(a)).join(' '));
                };
                
                // Set execution timeout
                timeoutId = setTimeout(() => {
                    self.postMessage({ 
                        logs, 
                        error: 'Execution timeout exceeded (30 seconds)' 
                    });
                    self.close();
                }, timeout);
                
                try {
                    // Execute code
                    const result = eval(code);
                    
                    // If there's a return value, show it
                    if (result !== undefined) {
                        logs.push('↩️ ' + String(result));
                    }
                    
                    clearTimeout(timeoutId);
                    self.postMessage({ logs });
                } catch (err) {
                    clearTimeout(timeoutId);
                    self.postMessage({ 
                        logs, 
                        error: err.toString() 
                    });
                } finally {
                    // Restore console
                    console.log = originalLog;
                    console.error = originalError;
                    console.warn = originalWarn;
                }
            };
        `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const startTime = performance.now();

        worker.onmessage = (e) => {
            const executionTime = performance.now() - startTime;
            const { logs, error } = e.data;

            worker.terminate();
            resolve({
                output: logs || [],
                error,
                executionTime,
            });
        };

        worker.onerror = (err) => {
            const executionTime = performance.now() - startTime;
            worker.terminate();
            resolve({
                output: [],
                error: `Worker Error: ${err.message}`,
                executionTime,
            });
        };

        // Send code to worker with 30 second timeout
        worker.postMessage({ code, timeout: 30000 });
    });
}

/**
 * Execute Python code using Pyodide (WASM)
 */
async function executePython(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();

    try {
        const pyodide = await getPyodide();
        const logs: string[] = [];

        // Redirect stdout and stderr to capture output
        pyodide.runPython(`
import sys
from io import StringIO

# Create string buffers for stdout and stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
        `);

        try {
            // Execute the user's code
            await pyodide.runPythonAsync(code);

            // Capture stdout
            const stdout = pyodide.runPython('sys.stdout.getvalue()');
            if (stdout) {
                logs.push(...stdout.split('\n').filter((line: string) => line.trim()));
            }

            // Capture stderr
            const stderr = pyodide.runPython('sys.stderr.getvalue()');
            if (stderr) {
                logs.push(...stderr.split('\n').filter((line: string) => line.trim()).map((line: string) => `❌ ${line}`));
            }

            const executionTime = performance.now() - startTime;
            return {
                output: logs,
                executionTime,
            };
        } catch (err: any) {
            const executionTime = performance.now() - startTime;

            // Parse Python error for better display
            let errorMessage = err.toString();

            // Try to extract just the error message without the full traceback
            const lines = errorMessage.split('\n');
            const lastLine = lines[lines.length - 1];
            if (lastLine && lastLine.includes('Error:')) {
                errorMessage = lastLine;
            }

            return {
                output: logs,
                error: errorMessage,
                executionTime,
            };
        }
    } catch (err: any) {
        const executionTime = performance.now() - startTime;
        return {
            output: [],
            error: `Failed to initialize Python runtime: ${err.message}`,
            executionTime,
        };
    }
}

/**
 * Main execution function - routes to appropriate executor based on language
 */
export async function executeCode(
    code: string,
    language: 'javascript' | 'python'
): Promise<ExecutionResult> {
    if (!code.trim()) {
        return {
            output: ['No code to execute'],
            executionTime: 0,
        };
    }

    switch (language) {
        case 'javascript':
            return executeJavaScript(code);
        case 'python':
            return executePython(code);
        default:
            return {
                output: [],
                error: `Execution for ${language} is not supported yet.`,
                executionTime: 0,
            };
    }
}

/**
 * Check if Pyodide is loaded
 */
export function isPyodideLoaded(): boolean {
    return pyodideInstance !== null;
}

/**
 * Preload Pyodide to reduce first execution time
 */
export async function preloadPyodide(): Promise<void> {
    await getPyodide();
}
