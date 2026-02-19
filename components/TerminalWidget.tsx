'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as TerminalIcon } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

interface TerminalWidgetProps {
  initialText?: string;
  onInput?: (input: string) => void;
  readOnly?: boolean;
}

export default function TerminalWidget({ initialText = '', onInput, readOnly = false }: TerminalWidgetProps = {}) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef<string>('');
  const isReadyRef = useRef(false);

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#09090b',
        foreground: '#a1a1aa',
        cursor: '#52525b',
        selectionForeground: '#09090b',
        selectionBackground: '#a1a1aa',
      },
      allowTransparency: false,
      scrollback: 1000,
      rows: 24,
      cols: 80,
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);

    // Initial welcome message
    term.writeln('\r\n\x1b[1;32m╔═══════════════════════════════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;32m║\x1b[0m    \x1b[1;36m🐾 OpenClaw Terminal\x1b[0m - \x1b[90mConnected\x1b[0m                      \x1b[1;32m║\x1b[0m');
    term.writeln('\x1b[1;32m╚═══════════════════════════════════════════════════════════════╝\x1b[0m\r\n');

    if (initialText) {
      term.writeln(initialText);
    }

    term.writeln('');
    term.write('\x1b[1;35mopenclaw\x1b[0m\x1b[90m@\x1b[0m\x1b[1;33mterminal\x1b[0m \x1b[90m~\x1b[0m $ ');

    // Handle input
    if (!readOnly && onInput) {
      term.onData((data) => {
        if (data === '\r') { // Enter key
          term.writeln('');
          onInput(inputBufferRef.current);
          inputBufferRef.current = '';
          term.write('\x1b[1;35mopenclaw\x1b[0m\x1b[90m@\x1b[0m\x1b[1;33mterminal\x1b[0m \x1b[90m~\x1b[0m $ ');
        } else if (data === '\x7f') { // Backspace
          if (inputBufferRef.current.length > 0) {
            inputBufferRef.current = inputBufferRef.current.slice(0, -1);
            term.write('\b \b');
          }
        } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) {
          inputBufferRef.current += data;
          term.write(data);
        }
      });
    }

    // Fit after delay
    requestAnimationFrame(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('FitAddon fit error:', e);
      }
    });

    xtermRef.current = term;
    isReadyRef.current = true;

    // Handle resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.warn('FitAddon resize error:', e);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      isReadyRef.current = false;
    };
  }, [initialText, onInput, readOnly]);

  // Clear terminal method
  const clearTerminal = useCallback(() => {
    if (xtermRef.current) {
      xtermRef.current.clear();
    }
  }, []);

  return (
    <div className="h-full flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearTerminal}
            className="text-xs px-2 py-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Terminal Container */}
      <div className="flex-1 overflow-hidden relative bg-zinc-950">
        <div ref={terminalRef} className="absolute inset-0 p-4" />
      </div>

      {/* Terminal Footer */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>xterm.js 6.0</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Ready
          </span>
        </div>
      </div>
    </div>
  );
}
