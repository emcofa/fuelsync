import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setTokenProvider } from './lib/api';

const App = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenProvider(getToken);
  }, [getToken]);

  return (
    <div className="p-8">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-4">
          <p className="text-green-600 font-medium">Ready to build</p>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default App;