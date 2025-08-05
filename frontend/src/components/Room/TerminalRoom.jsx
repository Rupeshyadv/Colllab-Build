import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

function TerminalRoom() {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null) // { terminal, fitAddon }
  const { roomId } = useParams()

  const [terminalHeight, setTerminalHeight] = useState(400)
  const [isResizing, setIsResizing] = useState(false)

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

    // simple shell-like input
    let currentLine = ''
    terminal.write('\x1b[1;33m$\x1b[0m ')
    terminal.onData((data) => {
      const code = data.charCodeAt(0)
      if (code === 13) { // Enter
        terminal.writeln('')
        currentLine = ''
        terminal.write('\x1b[1;33m$\x1b[0m ')
      } else if (code === 127) { // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1)
          terminal.write('\b \b')
        }
      } else if (code >= 32) { // printable
        currentLine += data
        terminal.write(data)
      }
    })

    const handleWindowResize = () => fitAddon.fit()
    window.addEventListener('resize', handleWindowResize)

    terminalInstanceRef.current = { terminal, fitAddon }

    return () => {
      window.removeEventListener('resize', handleWindowResize)
      terminal.dispose()
      terminalInstanceRef.current = null
    }
  }, [roomId])

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
