import { useContext, useState, useEffect } from "react";
import "./header.css";
import CartContext from "./Context/CartContext";
import { Bag } from "./Context/Bag";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
function Header(){
    const b = useContext(Bag);
    const a = useContext(CartContext);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setIsAuthenticated(!!user);
      });
      return () => unsubscribe();
    }, []);

    function upd(){
        b.update();
    }

    return (
      <header>
        <nav>
          <div className="container">
            <Link to={'/'}>
              <img 
                className="w40" 
                src="https://store-giga.vercel.app/static/media/logo.602f42bc5247b6c8fc88dcf001c1a477.svg" 
                alt="Logo" 
              />
            </Link>
            <div className="nav-links">
              {isAuthenticated ? (
                <Link to="/account" className="account-link">My Account</Link>
              ) : (
                <Link to="/auth" className="account-link">Sign In</Link>
              )}
              <button className="float w40" onClick={upd}>
                🛒<div className="cart">{a.state}</div>
              </button>
            </div>
          </div>
        </nav>
      </header>
    );
}
export default Header;