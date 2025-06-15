import React, { useEffect, useState, useContext } from 'react';
import "./checkout.css";
import CartContext from "../Context/CartContext.js";
import AddedItem from "../addedItem.js";
import { collection, addDoc, setDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase.js';
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const { 
    cartItems, 
    setCartItems, 
    item, 
    setState, 
    getTotal, 
    getDefault, 
    userId, 
    setUserId,
    clearCart 
  } = useContext(CartContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        // Fetch user's saved information
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFirstName(userData.firstName || '');
            setLastName(userData.lastName || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setAddress(userData.address || '');
            setCity(userData.city || '');
            setStateName(userData.state || '');
            setPostalCode(userData.postalCode || '');
            setCountry(userData.country || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [setUserId]);

  const delAll = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };
  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validate phone format (optional field)
  const isValidPhone = (phone) => {
    return phone === '' || /^\+?[\d\s-]+$/.test(phone);
  };
  const handleCheckOut = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/auth');
        return;
      }

      // Validate required fields
      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !address?.trim() || 
          !city?.trim() || !state?.trim() || !postalCode?.trim() || !country?.trim()) {
        alert("Please fill in all the required fields.");
        return;
      }

      // Validate email format
      if (!isValidEmail(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Validate phone if provided
      if (!isValidPhone(phone)) {
        alert("Please enter a valid phone number or leave it empty.");
        return;
      }

      // Validate cart is not empty
      if (!cartItems || Object.values(cartItems).every(qty => qty <= 0)) {
        alert("Your cart is empty. Please add some items before checking out.");
        return;
      }

      // Get all items in cart with their quantities and customization details
      const outProducts = item
        .filter(it => cartItems[it.id] && cartItems[it.id] > 0)
        .map(it => {
          // Ensure all numeric values are properly parsed
          const basePrice = parseFloat(it.price) || 0;
          const customizationFee = it.customization ? (parseFloat(it.customization.customizationFee) || 5.00) : 0;
          const quantity = cartItems[it.id] || 0;
          
          // Create the order item with all required fields
          return {
            id: it.id,
            title: it.title || 'Untitled Product',
            category: it.category || 'Uncategorized',
            price: basePrice,
            image: it.image || it.imageUrl || '',
            quantity: quantity,
            customization: it.customization ? {
              designImage: it.customization.designImage || '',
              previewImage: it.customization.previewImage || '',
              side: it.customization.side || 'front',
              customizationFee: customizationFee,
              position: {
                x: it.customization.position?.x || 0,
                y: it.customization.position?.y || 0,
                width: it.customization.position?.width || 100,
                height: it.customization.position?.height || 100,
                rotation: it.customization.position?.rotation || 0,
                scaleX: it.customization.position?.scaleX || 1,
                scaleY: it.customization.position?.scaleY || 1
              }
            } : null,
            finalPrice: basePrice + customizationFee,
            subtotal: quantity * (basePrice + customizationFee)
          };
        });

      // Save user profile info
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: (phone || '').trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        updatedAt: new Date().toISOString()
      });

      // Prepare order data
      const orderData = {
        orderInfo: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: (phone || '').trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
          orderNotes: (orderNotes || '').trim()
        },
        items: outProducts,
        total: parseFloat(getTotal().toFixed(2)),
        subtotal: outProducts.reduce((acc, item) => acc + item.subtotal, 0),
        totalItems: outProducts.reduce((acc, item) => acc + item.quantity, 0),
        customizationTotal: outProducts.reduce((acc, item) => 
          acc + (item.customization ? item.customization.customizationFee * item.quantity : 0), 0),
        timestamp: new Date().toISOString(),
        status: 'pending',
        userId: user.uid
      };

      // Save order
      const orderRef = await addDoc(collection(db, 'users', user.uid, 'orders'), orderData);

      // Create a reference in the main orders collection for admin view
      await setDoc(doc(db, 'orders', orderRef.id), {
        ...orderData,
        orderId: orderRef.id
      });

      alert("Order placed successfully!");
      clearCart();
      navigate('/');    } catch (error) {
      console.error("Error placing order:", error);
      alert(
        error.code === 'permission-denied' 
          ? "You don't have permission to place orders. Please log in again."
          : "Failed to place the order. Please try again."
      );
    }
  };

  const total = getTotal();

  return (
    <div className="checkout-main">
      <div id="added">
        {item
          .filter(it => cartItems[it.id] && cartItems[it.id] > 0)
          .map(it => (
            <AddedItem
              key={it.id}
              type={it.category}
              name={it.title}
              price={it.price}
              link={it.image}
              id={it.id}
              customization={it.customization}
            />
          ))}
      </div>
      
      <div id="form">
        <h3>Shipping Details</h3>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Street Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          placeholder="State/Province"
          value={state}
          onChange={(e) => setStateName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Postal/ZIP Code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <textarea
          placeholder="Order Notes (Optional)"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
        ></textarea>
      </div>

      <div id="pos">Total: ${total.toFixed(2)}</div>
      
      <div className="checkout-buttons">
        <button className="check clear-cart" onClick={delAll}>
          🗑️ Clear Cart
        </button>
        <button className="check place-order" onClick={handleCheckOut}>
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Checkout;
