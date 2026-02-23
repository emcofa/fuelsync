import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const App = () => {
  return (
    <div className="p-8">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-4">
          <p className="text-green-600 font-medium">Clerk is working</p>
          <UserButton />
        </div>
      </SignedIn>
    </div>
  );
};

export default App;