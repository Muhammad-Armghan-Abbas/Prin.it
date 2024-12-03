import "./ShoppingBag.css"
import CartContext from "./Context/CartContext";
import { useContext} from "react";
import { Bag } from "./Context/Bag";
import AddedItem from "./addedItem";
import { Link } from "react-router-dom";
function ShoppingBag() {
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
    const total = a.getTotal();
    return (
        <div className={`mainC ${b.open ? 'open' : 'close'}`}>
            <div>SHOPPINGBAG<span> ({a.state})</span><button onClick={upd}><img id="arrow" src="https://www.freeiconspng.com/uploads/right-arrow-icon-12.png" alt="arrow"></img></button></div><hr></hr>
            <div id="added">
                {a.item.map((it) => {
                    if (cartItems[it.id] !== 0) {
                        return (
                            <AddedItem
                                type={it.category}
                                name={it.title}
                                price={it.price}
                                link={it.image}
                                id={it.id}
                                key={it.id}
                            ></AddedItem>
                        )
                    }
                })}
            </div>
            <div id="pos">Total: ${total.toFixed(0)}</div><div><button onClick={delAll} id="del">🗑️</button></div>
            <Link className="check" id="view" to={'/checkout'}><div>View Cart</div></Link>
            {/* <button className="check" id="view">View Cart</button> */}
            <button className="check" id="out">Checkout</button>
        </div>
    );
}
export default ShoppingBag;