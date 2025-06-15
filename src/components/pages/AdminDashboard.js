import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase.js';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import '../../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingDeliveryDetails, setViewingDeliveryDetails] = useState(null);  
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    stock: ''
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    outOfStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedTab, setSelectedTab] = useState('products'); // 'products' or 'orders'
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSort, setOrderSort] = useState('date-desc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async (user) => {
      if (!user) {
        navigate('/admin/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          setError('Unauthorized access');
          navigate('/');
          return;
        }
        
        // Proceed with data fetching only if admin
        await fetchProducts();
        await fetchOrders();
        setIsLoading(false);
      } catch (err) {
        console.error('Error verifying admin status:', err);
        setError('Error verifying permissions');
        navigate('/');
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      checkAdminStatus(user);
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
      setStats({
        totalProducts: productList.length,
        totalRevenue: calculateTotalRevenue(productList),
        outOfStock: countOutOfStock(productList)
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const calculateTotalRevenue = (products) => {
    return products.reduce((total, product) => total + (Number(product.price) || 0), 0);
  };

  const countOutOfStock = (products) => {
    return products.filter(product => !product.stock || product.stock === 0).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      console.log('Product added with ID:', docRef.id);
      setNewProduct({ name: '', price: '', description: '', imageUrl: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate('/admin/login');
  };
  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name || product.title || '',
      category: product.category || '',
      price: product.price || '',
      description: product.description || '',
      imageUrl: product.imageUrl || product.image || '',
      stock: product.stock || product.inventory || 0
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, editFormData);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      console.log('Product deleted with ID:', id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

 const fetchOrders = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    let allOrders = [];
    let totalOrders = 0;
    let pendingOrders = 0;
    let completedOrders = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const ordersRef = collection(db, 'users', userId, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);

      if (!ordersSnapshot.empty) {
        const userOrders = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          userId,
          status: doc.data().status || 'pending',
          ...doc.data()
        }));
        
        // Update order statistics
        userOrders.forEach(order => {
          if (order.status === 'delivered') {
            completedOrders++;
          } else if (order.status === 'pending') {
            pendingOrders++;
          }
        });

        allOrders = [...allOrders, ...userOrders];
        totalOrders += userOrders.length;
      }
    }

    // Update component state
    setOrders(allOrders);
    setStats(prevStats => ({
      ...prevStats,
      totalOrders,
      pendingOrders,
      completedOrders
    }));

  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};


  const handleUpdateOrderStatus = async (order) => {
    setEditingOrder(order);
  };

  const handleOrderStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const orderRef = doc(db, 'users', editingOrder.userId, 'orders', editingOrder.id);
      await updateDoc(orderRef, {
        status: e.target.status.value,
        updatedAt: new Date()
      });
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleDeleteOrder = async (userId, orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'orders', orderId));
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const getFilteredAndSortedOrders = () => {
    let filtered = orders;
    
    // Apply status filter
    if (orderFilter !== 'all') {
      filtered = filtered.filter(order => order.status === orderFilter);
    }
    
    // Apply search filter
    if (orderSearch) {
      const searchLower = orderSearch.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchLower) ||
        order.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (orderSort) {
        case 'date-asc':
          return new Date(a.timestamp) - new Date(b.timestamp);
        case 'date-desc':
          return new Date(b.timestamp) - new Date(a.timestamp);
        case 'total-asc':
          return a.total - b.total;
        case 'total-desc':
          return b.total - a.total;
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return null; // Component will unmount due to navigation
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <button 
            onClick={() => setSelectedTab('products')} 
            className={`btn-tab ${selectedTab === 'products' ? 'btn-tab-active' : ''}`}
          >
            Products
          </button>
          <button 
            onClick={() => setSelectedTab('orders')} 
            className={`btn-tab ${selectedTab === 'orders' ? 'btn-tab-active' : ''}`}
          >
            Orders
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      {selectedTab === 'products' ? (
        <>
          <div className="dashboard-stats">
            <div className="stats-card">
              <h3>Total Products</h3>
              <p className="stats-value">{stats.totalProducts}</p>
            </div>
            <div className="stats-card">
              <h3>Total Revenue</h3>
              <p className="stats-value">${stats.totalRevenue}</p>
            </div>
            <div className="stats-card">
              <h3>Out of Stock</h3>
              <p className="stats-value">{stats.outOfStock}</p>
            </div>
          </div>

          <div className="products-section">
            <div className="products-header">
              <h2>Products</h2>
              <button onClick={() => setEditingProduct({})} className="btn-primary">
                Add New Product
              </button>
            </div>

            <div className="product-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={product.image || product.imageUrl}
                      alt={product.title || product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <span className="product-category">
                      {product.category || 'Uncategorized'}
                    </span>
                    <h3 className="product-title">{product.title || product.name}</h3>
                    <p className="product-price">${product.price}</p>
                    <p className="product-description">{product.description}</p>
                    {product.rating && (
                      <div className="product-rating">
                        <div className="rating-stars">
                          <span>★</span>
                          <span>{product.rating.rate}</span>
                        </div>
                        <span>({product.rating.count} reviews)</span>
                      </div>
                    )}
                    <div className="product-footer">
                      <span className={`product-stock ${(product.stock > 0 || product.inventory > 0) ? 'in-stock' : 'out-of-stock'}`}>
                        {(product.stock > 0 || product.inventory > 0) ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <div className="product-actions">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="btn-primary"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="orders-section">
          <div className="dashboard-stats">
            <div className="stats-card">
              <h3>Total Orders</h3>
              <p className="stats-value">{stats.totalOrders}</p>
            </div>
            <div className="stats-card">
              <h3>Pending Orders</h3>
              <p className="stats-value">{stats.pendingOrders}</p>
            </div>
            <div className="stats-card">
              <h3>Completed Orders</h3>
              <p className="stats-value">{stats.completedOrders}</p>
            </div>
          </div>

          <div className="orders-header">
            <h2 className="section-title">Orders</h2>
            <div className="orders-filters">
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="search-input"
              />
              <select
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={orderSort}
                onChange={(e) => setOrderSort(e.target.value)}
                className="sort-select"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="total-desc">Highest Total</option>
                <option value="total-asc">Lowest Total</option>
              </select>
            </div>
          </div>

          <div className="orders-grid">
            {getFilteredAndSortedOrders().map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span 
                      className="order-id" 
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => setViewingDeliveryDetails(order)}
                    >
                      Order #{order.id.slice(-6)}
                    </span>                    <span className="order-date">
                      {order.timestamp?.seconds 
                        ? new Date(order.timestamp.seconds * 1000).toLocaleString()
                        : order.timestamp instanceof Date 
                          ? order.timestamp.toLocaleString()
                          : typeof order.timestamp === 'string'
                            ? new Date(order.timestamp).toLocaleString()
                            : 'No date available'}
                    </span>
                  </div>
                  <div className="order-header-right">
                    <span className={`order-status status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="order-total">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {(order.firstName || order.lastName) && (
                  <div className="order-customer">
                    <h4>Customer: {order.firstName} {order.lastName}</h4>
                  </div>
                )}                <div className="order-items">                  <h4>Items ({order.items?.length || 0})</h4>
                  {order.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="order-item-image-container">
                        {item.customization ? (
                          <div className="customized-preview">
                            <img 
                              src={item.customization.previewImage || item.image} 
                              alt={item.title}
                              className="order-item-image"
                              onError={(e) => {
                                e.target.src = item.image || '/placeholder.png';
                              }}
                            />
                            <span className="customized-badge">Customized</span>
                          </div>
                        ) : (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="order-item-image"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                            }}
                          />
                        )}
                      </div>
                      <div className="order-item-details">
                        <div className="order-item-header">
                          <span className="order-item-name">{item.title}</span>
                          <span className="order-item-category">{item.category}</span>
                        </div>
                        <div className="order-item-info">
                          <p>Quantity: {item.quantity}</p>
                          <p>Unit Price: ${item.price.toFixed(2)}</p>
                          {item.customization && (
                            <p>Customization Fee: ${item.customization.customizationFee.toFixed(2)}</p>
                          )}
                          <p className="item-total">
                            Item Total: ${((item.customization ? item.finalPrice : item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="order-total-section">
                    <span className="order-total-label">Order Total:</span>
                    <span className="order-total-amount">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    onClick={() => handleUpdateOrderStatus(order)}
                    className="btn-primary"
                  >
                    Update Status
                  </button>
                  <button 
                    onClick={() => handleDeleteOrder(order.userId, order.id)}
                    className="btn-danger"
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingProduct.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="modal-close"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateProduct} className="modal-form">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  name="category"
                  value={editFormData.category || ''}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder="Enter product category"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditFormChange}
                  className="form-input min-h-[100px]"
                  placeholder="Enter product description"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={editFormData.imageUrl}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder="https://example.com/image.jpg"
                  required
                />                {editFormData.imageUrl && (
                  <div className="image-preview">
                    <img
                      src={editFormData.imageUrl}
                      alt="Product preview"
                      className="preview-image"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={editFormData.stock}
                  onChange={handleEditFormChange}
                  className="form-input"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingProduct.id ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="modal-close"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleOrderStatusUpdate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Order Status</label>
                <select
                  name="status"
                  defaultValue={editingOrder.status || 'pending'}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Update Status
                </button>
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingDeliveryDetails && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delivery Details</h2>
              <button
                type="button"
                onClick={() => setViewingDeliveryDetails(null)}
                className="modal-close"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="delivery-details">                <div className="detail-group">
                  <h3>Shipping Address</h3>
                  <p>{viewingDeliveryDetails.orderInfo?.firstName} {viewingDeliveryDetails.orderInfo?.lastName}</p>
                  <p>{viewingDeliveryDetails.orderInfo?.address}</p>
                  <p>{viewingDeliveryDetails.orderInfo?.city}, {viewingDeliveryDetails.orderInfo?.state} {viewingDeliveryDetails.orderInfo?.postalCode}</p>
                  <p>{viewingDeliveryDetails.orderInfo?.country}</p>
                </div>
                <div className="detail-group">
                  <h3>Contact Information</h3>
                  <p>Email: {viewingDeliveryDetails.orderInfo?.email}</p>
                  <p>Phone: {viewingDeliveryDetails.orderInfo?.phone || 'N/A'}</p>
                </div>
                <div className="detail-group">
                  <h3>Shipping Method</h3>
                  <p>{viewingDeliveryDetails.shippingMethod || 'Standard Shipping'}</p>
                </div>
                <div className="detail-group">
                  <h3>Order Status</h3>
                  <p className={`status-${viewingDeliveryDetails.status}`}>
                    {viewingDeliveryDetails.status.charAt(0).toUpperCase() + viewingDeliveryDetails.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setViewingDeliveryDetails(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
