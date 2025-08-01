import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

function TerminalRoom() {
  const terminalRef = useRef(null)
  const terminalInstanceRef = useRef(null)
  const resizeRef = useRef(null)
  const containerRef = useRef(null)
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
      const newHeight = Math.max(0, Math.min(800, startHeight + deltaY))
      setTerminalHeight(newHeight)
      
      // Trigger terminal resize
      if (terminalInstanceRef.current) {
        setTimeout(() => {
          const fitAddon = terminalInstanceRef.current?.['_addonManager']?.['_addons']?.find(
            (addon) => addon.instance instanceof FitAddon
          )?.instance
          if (fitAddon) {
            fitAddon.fit()
          }
        }, 0)
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
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
      allowTransparency: false,
      convertEol: true,
      scrollback: 1000,
      tabStopWidth: 4
    })

    const fitAddon = new FitAddon()
    terminal.loadAddon(fitAddon)

    terminal.open(terminalRef.current)
    fitAddon.fit()

    // Handle input
    let currentLine = ''
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
      } else if (code >= 32) { // Printable characters
        currentLine += data
        terminal.write(data)
      }
    })

    // Handle resize
    const handleResize = () => {
      fitAddon.fit()
    }
    window.addEventListener('resize', handleResize)

    terminalInstanceRef.current = terminal

    return () => {
      window.removeEventListener('resize', handleResize)
      terminal.dispose()
      terminalInstanceRef.current = null
    }
  }, [roomId, terminalHeight])

  return (
    <div ref={containerRef} className="flex flex-col bg-gray-[#000000]">       
        {/* Resize handle */}
        <div
          ref={resizeRef}
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
            <div 
              ref={terminalRef} 
              className="h-full w-full p-2"
            />
          </div>
        </div>
    </div>
  )
}

export default TerminalRoom