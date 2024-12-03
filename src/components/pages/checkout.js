import React, { useEffect, useState, useContext } from 'react';
import "./checkout.css";
import CartContext from "../Context/CartContext";
import AddedItem from "../addedItem";
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Checkout() {
  const { cartItems, setCartItems, item, setState, getTotal, getDefault, userId, setUserId } = useContext(CartContext);
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, [setUserId]);

  const delAll = () => {
    setCartItems(getDefault());
    setState(0);
  };

  const total = getTotal();

  const handleCheckOut = async () => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    if (!firstName || !lastName || !email || !address || !city || !state || !postalCode || !country) {
      alert("Please fill in all the required fields.");
      return;
    }

    const outProducts = item.filter((it) => cartItems[it.id] !== 0);

    try {
      await addDoc(collection(db, 'users', userId, 'orders'), {
        out: outProducts,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        orderNotes,
        total,
        timestamp: new Date(),
      });
      alert("Order placed successfully!");
      delAll(); // Clear cart after successful order
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place the order. Please try again.");
    }
  };

  return (
    <div className="checkout-main">
      <div id="added">
        {item.map((it) =>
          cartItems[it.id] ? (
            <AddedItem
              key={it.id}
              type={it.category}
              name={it.title}
              price={it.price}
              link={it.image}
              id={it.id}
            />
          ) : null
        )}
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
      <button className="check" onClick={delAll}>🗑️ Clear Cart</button>
      <button className="check" onClick={() => navigate('/cart')}>View Cart</button>
      <button className="check" onClick={handleCheckOut}>Checkout</button>
    </div>
  );
}

export default Checkout;
