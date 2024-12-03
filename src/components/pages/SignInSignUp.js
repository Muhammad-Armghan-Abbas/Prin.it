import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router v6
import "./SignInSignUp.css"
function AuthForm({ mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();  // Correctly use useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        // Sign-in logic
        await signInWithEmailAndPassword(auth, email, password);
        // Redirect to the checkout page after successful login
        navigate('/checkout');  // Use navigate here instead of history.push
      } else {
        // Sign-up logic
        await createUserWithEmailAndPassword(auth, email, password);
        // Redirect to the checkout page after successful sign-up
        navigate('/checkout');  // Use navigate here instead of history.push
      }
    } catch (err) {
      setError(err.message);  // Handle errors (e.g., wrong credentials)
    }
  };

  return (
    <div className='sign-cont'>
      <div className='cont2'>
      <h2>{mode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{mode === 'login' ? 'Sign In' : 'Sign Up'}</button>
      </form>
      </div>
    </div>
  );
}

export default AuthForm;
