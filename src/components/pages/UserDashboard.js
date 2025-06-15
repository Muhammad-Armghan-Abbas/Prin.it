import React, { useState, useEffect, useContext } from 'react';
import { auth, db } from '../../firebase.js';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import CartContext from '../Context/CartContext.js';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const { userId } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }
    fetchUserProfile();
    fetchUserOrders();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setProfile(userDoc.data());
        setEditForm(userDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };
  const fetchUserOrders = async () => {
    try {
      const ordersRef = collection(db, 'users', auth.currentUser.uid, 'orders');
      const ordersSnapshot = await getDocs(ordersRef);
      const ordersList = ordersSnapshot.docs.map(doc => {
        const data = doc.data();
        // Handle different timestamp formats
        let timestamp = new Date().toLocaleString();
        if (data.timestamp) {
          if (typeof data.timestamp === 'string') {
            timestamp = new Date(data.timestamp).toLocaleString();
          } else if (data.timestamp.toDate instanceof Function) {
            timestamp = data.timestamp.toDate().toLocaleString();
          }
        }
        return {
          id: doc.id,
          ...data,
          timestamp
        };
      });
      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), editForm);
      setProfile(editForm);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>My Account</h1>
        <div className="tab-navigation">          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button 
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Profile Information</h2>
              {!isEditing && (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="edit-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={editForm.address || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={editForm.city || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="state"
                    value={editForm.state || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal/ZIP Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={editForm.postalCode || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={editForm.country || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                {profile && (
                  <>
                    <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                    <p><strong>Email:</strong> {profile.email}</p>
                    <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
                    <div className="address-info">
                      <h3>Address Information</h3>
                      <p><strong>Street Address:</strong> {profile.address || 'Not provided'}</p>
                      <p><strong>City:</strong> {profile.city || 'Not provided'}</p>
                      <p><strong>State/Province:</strong> {profile.state || 'Not provided'}</p>
                      <p><strong>Postal/ZIP Code:</strong> {profile.postalCode || 'Not provided'}</p>
                      <p><strong>Country:</strong> {profile.country || 'Not provided'}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>Order History</h2>
            {orders.length > 0 ? (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order.id.slice(-6)}</span>
                      <span className="order-date">{order.timestamp}</span>
                      <span className="order-status">{order.status || 'Processing'}</span>
                    </div>                    <div className="order-items">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-image-container">
                            {item.customization ? (
                              <div className="customized-item-preview">
                                <img 
                                  src={item.customization.previewImage || item.image} 
                                  alt={item.title}
                                  onError={(e) => {
                                    e.target.src = item.image || '/placeholder.png';
                                  }}
                                />
                                <span className="customization-badge">Customized</span>
                              </div>
                            ) : (
                              <img 
                                src={item.image} 
                                alt={item.title}
                                onError={(e) => {
                                  e.target.src = '/placeholder.png';
                                }}
                              />
                            )}
                          </div>
                          <div className="item-details">
                            <h4>{item.title}</h4>
                            <p className="item-category">{item.category}</p>
                            <p>Quantity: {item.quantity || 1}</p>
                            <p>Unit Price: ${(item.price || 0).toFixed(2)}</p>
                            {item.customization && (
                              <div className="customization-details">
                                <p className="customization-note">Customized Product</p>
                                <p>Customization Fee: ${item.customization.customizationFee.toFixed(2)}</p>
                              </div>
                            )}
                            <p className="item-total">
                              Item Total: ${((item.customization ? item.finalPrice : item.price) * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span className="order-total">Total: ${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-orders">No orders found</p>
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="addresses-section">
            <h2>Delivery Addresses</h2>
            {profile && (
              <div className="address-card">
                <h3>Default Address</h3>
                <p>{profile.address}</p>
                <p>{profile.city}, {profile.state} {profile.postalCode}</p>
                <p>{profile.country}</p>
                <button 
                  className="edit-btn"
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab('profile');
                  }}
                >
                  Edit Address
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
