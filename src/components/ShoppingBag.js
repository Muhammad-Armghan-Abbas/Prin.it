import "./ShoppingBag.css"
import CartContext from "./Context/CartContext";
import { useContext, useState } from "react";
import { Bag } from "./Context/Bag";
import AddedItem from "./addedItem";
import { useNavigate } from "react-router-dom";
/*import { Link } from "react-router-dom";*/
function ShoppingBag() {
    const [warning, setWarning] = useState(false);
    const navigate = useNavigate();
    const a = useContext(CartContext);
    const { cartItems } = useContext(CartContext)
    const b = useContext(Bag);
    function upd() {
        b.update();
    }
    function delAll() {
        a.setCartItems(a.getDefault());
        a.setState(0);
    }
    const total = a.getTotal();    return (
        <div className={`mainC ${b.open ? 'open' : 'close'}`}>
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
                Checkout
            </div>

            {/*<Link className="check" id="view" to={'/checkout'}><div>View Cart</div></Link>
            /* <button className="check" id="view">View Cart</button>
            <Link className="check" id="out" to={'/checkout'}><div>Checkout</div></Link>
            /*<button className="check" id="out">Checkout</button>*/}
        </div>
    );
}
export default ShoppingBag;