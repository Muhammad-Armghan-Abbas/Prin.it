import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();

  useEffect(() => {
    // Add authentication check here
    const isAuthenticated = localStorage.getItem('adminToken');
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default AdminLayout;
