import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router v6
import "./SignInSignUp.css"
function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = getAuth();
  const [mode, setMode] = useState('login');
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
        <div>
          <h2>{mode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
          <input id="check" type="checkbox" onClick={() => setMode(mode === 'login' ? 'Sign In' : 'login')} />
          <label class="switch" for="check">
            <svg viewBox="0 0 212.4992 84.4688" overflow="visible">
              <path
                pathLength="360"
                fill="none"
                stroke="currentColor"
                d="M 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 A 42.24 42.24 90 0 0 84.4992 42.2496 A 42.24 42.24 90 0 0 42.2496 0 A 42.24 42.24 90 0 0 0 42.2496 A 42.24 42.24 90 0 0 42.2496 84.4688 L 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 A 42.24 42.24 90 0 0 128 42.2496 A 42.24 42.24 90 0 0 170.2496 84.4688 A 42.24 42.24 90 0 0 212.4992 42.2496 A 42.24 42.24 90 0 0 170.2496 0 L 42.2496 0"
              ></path>
            </svg>
          </label>
        </div>
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
