import { NavLink } from 'react-router-dom'
import { Home, BookOpen, PlusCircle, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/recipes', icon: BookOpen, label: 'Recipes' },
  { to: '/recipes/new', icon: PlusCircle, label: 'Create' },
  { to: '/memo', icon: Settings, label: 'Memo' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50">
      <div
        className="flex justify-around items-center px-2 py-3"
        style={{
          background: 'rgba(10,10,10,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(201,168,76,0.15)',
        }}
      >
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 transition-all duration-200 ${
                isActive ? 'text-[#c9a84c]' : 'text-[#5a5555]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'drop-shadow-[0_0_6px_rgba(201,168,76,0.6)]' : ''}
                />
                <span className="text-[10px] font-medium tracking-widest uppercase">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
