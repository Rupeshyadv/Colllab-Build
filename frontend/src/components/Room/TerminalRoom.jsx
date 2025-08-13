import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { socket } from '../../services/socket.js'
import { ClientToServerEvents, ServerToClientEvents } from '../../../../server/src/socket/socket.events.js'

function TerminalRoom() {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null) // { terminal, fitAddon }
  const { roomId } = useParams()

  const [terminalHeight, setTerminalHeight] = useState(400)
  const [isResizing, setIsResizing] = useState(false)
  
  // Termianl UI initialization
  useEffect(() => {
    if (!terminalRef.current) return

    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 15,
      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selection: '#3e4451',
        black: '#000000',
        red: '#e06c75',
        green: '#98c379',
        yellow: '#e5c07b',
        blue: '#61afef',
        magenta: '#c678dd',
        cyan: '#56b6c2',
        white: '#ffffff',
        brightBlack: '#5c6370',
        brightRed: '#e06c75',
        brightGreen: '#98c379',
        brightYellow: '#e5c07b',
        brightBlue: '#61afef',
        brightMagenta: '#c678dd',
        brightCyan: '#56b6c2',
        brightWhite: '#ffffff'
      },
      convertEol: true,
      scrollback: 1000,
      tabStopWidth: 4
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)
    terminal.open(terminalRef.current)
    fitAddon.fit()

    terminal.write('\x1b[1;33m$\x1b[0m ')
    
    // Adding terminal and fitaddon into terminalInstanceRef to handle input 
    terminalInstanceRef.current = { terminal, fitAddon }

    const handleWindowResize = () => fitAddon.fit()
    window.addEventListener('resize', handleWindowResize)

    terminalInstanceRef.current = { terminal, fitAddon }

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      terminal.dispose()
      terminalInstanceRef.current = null
    }
  }, [roomId])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)

    const startY = e.clientY
    const startHeight = terminalHeight

    const handleMouseMove = (e) => {
      const deltaY = startY - e.clientY
      const newHeight = Math.max(100, Math.min(800, startHeight + deltaY))
      setTerminalHeight(newHeight)
      // fit after next paint
      requestAnimationFrame(() => terminalInstanceRef.current?.fitAddon.fit())
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      // final fit after resize ends
      terminalInstanceRef.current?.fitAddon.fit()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [terminalHeight])

  useEffect(() => {
    const handleTerminalOutput = ({ output }) => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.terminal.write(output)
      }
    }

    const hadleClearTerminal = () => {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.terminal.reset()
      } 
    } 
    
    socket.on(ServerToClientEvents.CLEAR_TERMINAL, hadleClearTerminal)
    socket.on(ServerToClientEvents.TERMINAL_OUTPUT, handleTerminalOutput)

    return () => {
      socket.off(ServerToClientEvents.CLEAR_TERMINAL, hadleClearTerminal)
      socket.off(ServerToClientEvents.TERMINAL_OUTPUT, handleTerminalOutput)
    }
  }, [])

  // handle terminal input
  useEffect(() => {
    if (!terminalInstanceRef.current) return
    const { terminal } = terminalInstanceRef.current
    let currentInput = ''
    let execEnded = true;
    let isWaitingForInput = false; 

    const handleInput = (data) => { 
      if (execEnded) return; 

      const code = data.charCodeAt(0);

      if (code === 13) { // Enter
        terminal.writeln('');
        if (currentInput.trim()) {
          socket.emit(ClientToServerEvents.TERMINAL_INPUT, { input: currentInput });
          console.log("📤 Sending input to server:", currentInput); // Debug
        }
        currentInput = '';
        isWaitingForInput = false;
      } else if (code === 127) { // Backspace
        if (currentInput.length > 0) {
          currentInput = currentInput.slice(0, -1);
          terminal.write('\b \b');
        }
      } else if (code >= 32) { // printable
        currentInput += data;
        terminal.write(data);
      }
    }

    terminal.onData(handleInput);

    // Listen for execution start
    socket.on(ServerToClientEvents.EXECUTION_STARTED, () => {
      console.log("Execution started");
      execEnded = false; 
    });

    socket.on(ServerToClientEvents.EXECUTION_ENDED, () => {
      execEnded = true;
      console.log("Execution ended");
      isWaitingForInput = false;
      terminal.writeln("\r\n[Program finished]");
      terminal.write('\x1b[1;33m$\x1b[0m ');
    });

    return () => {
      socket.off(ServerToClientEvents.EXECUTION_STARTED);
      socket.off(ServerToClientEvents.EXECUTION_ENDED);
    }
  }, [])

  return (
    <div className="flex flex-col bg-black">
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`h-1 bg-gray-700 hover:bg-blue-500 cursor-row-resize transition-colors relative group ${
          isResizing ? 'bg-blue-500' : ''
        }`}
        title="Drag to resize terminal"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-0.5 bg-gray-500 group-hover:bg-blue-400 transition-colors"></div>
        </div>
      </div>

      {/* Terminal container */}
      <div
        className="bg-gray-900 border-t border-gray-700"
        style={{ height: `${terminalHeight}px` }}
      >
        <div className="h-full bg-gray-950 overflow-hidden">
          <div ref={terminalRef} className="h-full w-full p-2" />
        </div>
      </div>
    </div>
  )
}

export default TerminalRoom
