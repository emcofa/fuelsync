import Navbar from './Navbar';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
