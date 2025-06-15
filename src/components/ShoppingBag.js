import "./ShoppingBag.css"
import CartContext from "./Context/CartContext.js";
import { useContext, useState, useEffect, useRef } from "react";
import { Bag } from "./Context/Bag.js";
import AddedItem from "./addedItem.js";
import { useNavigate, useLocation } from "react-router-dom";

function ShoppingBag() {
    const [warning, setWarning] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const bagRef = useRef(null);
    const a = useContext(CartContext);
    const { cartItems } = useContext(CartContext);
    const b = useContext(Bag);    useEffect(() => {
        // Close bag on route change
        if (b.open) {
            upd();
        }
    }, [location]);

    useEffect(() => {
        function handleClickOutside(event) {
            const toggleButton = document.querySelector('.toggle-cart');
            if (bagRef.current && 
                !bagRef.current.contains(event.target) && 
                !toggleButton?.contains(event.target) &&
                b.open) {
                upd();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    function upd() {
        b.update();
    }
    function delAll() {
        a.setCartItems(a.getDefault());
        a.setState(0);
    }
    const total = a.getTotal();    return (
        <div className="shopping-bag-container">
            {b.open && <div className="shopping-bag-overlay" onClick={upd}></div>}
            <div ref={bagRef} className={`mainC ${b.open ? 'close' : 'open'}`}>
                <div className="shopping-bag-header">
                <span className="bag-title">SHOPPING BAG</span>
                <span className="item-count">({a.state})</span>
                <button onClick={upd} className="close-btn">
                    <img id="arrow" src="https://www.freeiconspng.com/uploads/right-arrow-icon-12.png" alt="arrow" />
                </button>
            </div>
            <hr />
            <div id="added">
                {a.item.filter(it => cartItems[it.id] > 0).map((it) => (
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
            <div className="cart-footer">
                <div className="cart-total">Total: ${total.toFixed(2)}</div>
                <button onClick={delAll} className="clear-cart" title="Clear Cart">🗑️</button>
            </div>
            {warning && <div className="warning">Please add at least one product to proceed.</div>}

            {warning && <div className="warning">Please add at least one product to proceed.</div>}

            <div className="check" id="view" onClick={() => {
                if (a.state > 0) {
                    navigate('/checkout');
                } else {
                    setWarning(true);
                    setTimeout(() => setWarning(false), 3000);
                }
            }}>
                View Cart
            </div>

            <div className="check" id="out" onClick={() => {
                if (a.state > 0) {
                    navigate('/checkout');
                } else {
                    setWarning(true);
                    setTimeout(() => setWarning(false), 3000);
                }
            }}>
                Checkout            </div>
            {/*<Link className="check" id="view" to={'/checkout'}><div>View Cart</div></Link>
            /* <button className="check" id="view">View Cart</button>
            <Link className="check" id="out" to={'/checkout'}><div>Checkout</div></Link>
            /*<button className="check" id="out">Checkout</button>*/}
        </div>
    </div>
    );
}
export default ShoppingBag;