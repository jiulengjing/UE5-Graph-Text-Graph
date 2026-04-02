import { useState, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

const MENUS = ['File', 'Edit', 'View', 'Help'];

export default function TitleBar() {
  const appWindow = getCurrentWindow();
  const [isMaximized, setIsMaximized] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    appWindow.isMaximized().then(setIsMaximized);
    const unsubscribe = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });
    return () => { unsubscribe.then(fn => fn()); };
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="h-[32px] bg-[#1a1a1a] select-none flex items-center justify-between fixed top-0 left-0 right-0 z-[9999] border-b border-[#2a2a2a]"
      data-tauri-drag-region
    >
      {/* Left: Icon + Menu bar */}
      <div className="flex items-center h-full" ref={menuRef}>
        {/* App icon */}
        <div className="w-[46px] h-full flex items-center justify-center shrink-0 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect width="14" height="14" rx="3" fill="#3b82f6" opacity="0.9"/>
            <path d="M4 7h6M7 4v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Menu items */}
        {MENUS.map(menu => (
          <div key={menu} className="relative h-full">
            <button
              className={`h-full px-3 text-[12px] font-medium transition-colors ${
                openMenu === menu
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#252525]'
              }`}
              onMouseDown={() => setOpenMenu(openMenu === menu ? null : menu)}
              onMouseEnter={() => openMenu !== null && setOpenMenu(menu)}
            >
              {menu}
            </button>
            {openMenu === menu && (
              <div className="absolute top-full left-0 mt-[1px] w-44 bg-[#252525] border border-[#3a3a3a] rounded shadow-xl z-50 py-1">
                {menu === 'File' && (
                  <>
                    <MenuItem label="Open .j2b File…" shortcut="Ctrl+O" />
                    <MenuItem label="Save Tab As…"  shortcut="Ctrl+S" />
                    <div className="h-px bg-[#3a3a3a] my-1" />
                    <MenuItem label="Exit" />
                  </>
                )}
                {menu === 'Edit' && (
                  <>
                    <MenuItem label="Select All" shortcut="Ctrl+A" />
                    <MenuItem label="Clear Board" />
                  </>
                )}
                {menu === 'View' && (
                  <>
                    <MenuItem label="Fit to Screen" shortcut="F" />
                    <MenuItem label="Zoom In" shortcut="Ctrl+=" />
                    <MenuItem label="Zoom Out" shortcut="Ctrl+-" />
                  </>
                )}
                {menu === 'Help' && (
                  <>
                    <MenuItem label="Keyboard Shortcuts" />
                    <MenuItem label="About Json2Board" />
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center: Title */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-[11px] text-gray-500 font-medium pointer-events-none tracking-wide"
        data-tauri-drag-region
      >
        Json2Board
      </div>

      {/* Right: Window controls */}
      <div className="flex h-full">
        <WinBtn onClick={() => appWindow.minimize()} label="minimize">
          <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor"><rect width="10" height="1"/></svg>
        </WinBtn>
        <WinBtn onClick={() => appWindow.toggleMaximize()} label="maximize">
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="0" width="8" height="8"/>
              <rect x="0" y="2" width="8" height="8" fill="#1a1a1a"/>
              <rect x="0" y="2" width="8" height="8"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="0.5" y="0.5" width="9" height="9"/>
            </svg>
          )}
        </WinBtn>
        <WinBtn onClick={() => appWindow.close()} label="close" isClose>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M10 .7L9.3 0 5 4.3.7 0 0 .7 4.3 5 0 9.3l.7.7L5 5.7 9.3 10l.7-.7L5.7 5z"/>
          </svg>
        </WinBtn>
      </div>
    </div>
  );
}

function MenuItem({ label, shortcut }: { label: string; shortcut?: string }) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-[5px] text-[12px] text-gray-300 hover:bg-[#3b82f6] hover:text-white transition-colors">
      <span>{label}</span>
      {shortcut && <span className="text-[10px] text-gray-500 group-hover:text-blue-200">{shortcut}</span>}
    </button>
  );
}

function WinBtn({
  onClick,
  label,
  isClose,
  children,
}: {
  onClick: () => void;
  label: string;
  isClose?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={`w-[46px] h-full flex items-center justify-center transition-colors text-gray-500 hover:text-white ${
        isClose ? 'hover:bg-[#e81123]' : 'hover:bg-[#2a2a2a]'
      }`}
    >
      {children}
    </button>
  );
}
