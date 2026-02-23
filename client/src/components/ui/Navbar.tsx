import { NavLink } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    to: '/food',
    label: 'Log Food',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    to: '/goals',
    label: 'Goals',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'flex items-center gap-2 rounded-md bg-indigo-700 px-3 py-2 text-sm font-medium text-white'
    : 'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500 hover:text-white';

const mobileLinkClasses = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'flex flex-col items-center gap-0.5 text-indigo-600 text-xs font-medium'
    : 'flex flex-col items-center gap-0.5 text-gray-400 text-xs font-medium hover:text-gray-600';

const Navbar = () => {
  const { signOut } = useClerk();
  const { user } = useUser();

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden bg-indigo-600 md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-white">FuelSync</span>
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClasses}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.firstName && (
              <span className="text-sm text-indigo-100">{user.firstName}</span>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-medium text-indigo-100 hover:bg-indigo-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={mobileLinkClasses}>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
