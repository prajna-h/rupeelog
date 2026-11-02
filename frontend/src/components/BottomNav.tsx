import { NavLink } from 'react-router-dom'

function navColor(isActive: boolean) {
  return isActive ? '#3F6B52' : '#9A978D'
}

export default function BottomNav() {
  return (
    <div className="flex-shrink-0 safe-bottom bg-white border-t border-[var(--border)] flex items-center justify-between px-5 pt-2.5 pb-3">
      <NavLink to="/" end className="flex flex-col items-center gap-1 w-[52px]" aria-label="Home">
        {({ isActive }) => (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={navColor(isActive)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 9.5V20a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1V9.5" />
            </svg>
            <span className="text-[11px]" style={{ color: navColor(isActive), fontWeight: isActive ? 700 : 500 }}>Home</span>
          </>
        )}
      </NavLink>

      <NavLink to="/summary" className="flex flex-col items-center gap-1 w-[52px]" aria-label="Summary">
        {({ isActive }) => (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={navColor(isActive)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="3.4" height="9" />
              <rect x="10.3" y="6" width="3.4" height="14" />
              <rect x="16.6" y="2.5" width="3.4" height="17.5" />
            </svg>
            <span className="text-[11px]" style={{ color: navColor(isActive), fontWeight: isActive ? 700 : 500 }}>Summary</span>
          </>
        )}
      </NavLink>

      <NavLink
        to="/add"
        aria-label="Add expense"
        className="flex items-center justify-center w-[54px] h-[54px] rounded-full flex-shrink-0"
        style={{ background: '#1C1B18', boxShadow: '0 8px 16px rgba(28,27,24,0.28)', marginTop: '-34px' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </NavLink>

      <NavLink to="/categories" className="flex flex-col items-center gap-1 w-[52px]" aria-label="Categories">
        {({ isActive }) => (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={navColor(isActive)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3.5 4h7l9 9-7 7-9-9z" />
              <circle cx="7.8" cy="8" r="1.3" fill={navColor(isActive)} stroke="none" />
            </svg>
            <span className="text-[11px]" style={{ color: navColor(isActive), fontWeight: isActive ? 700 : 500 }}>Categories</span>
          </>
        )}
      </NavLink>

      <div className="flex flex-col items-center gap-1 w-[52px] opacity-40" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9A978D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
        <span className="text-[11px] font-medium" style={{ color: '#9A978D' }}>More</span>
      </div>
    </div>
  )
}
