import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import ProductForm from '@/components/admin/ProductForm';
import ProductList from '@/components/admin/ProductList';

const AdminPanel = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <ProductForm onProductAdded={fetchProducts} />
        <ProductList products={products} onProductUpdated={fetchProducts} />
      </div>
    </AdminLayout>
  );
};

export default AdminPanel;
