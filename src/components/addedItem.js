import { useContext } from "react";
import "./addedItem.css";
import CartContext from "./Context/CartContext";
function AddedItem({ type, name, price, link, id }) {
    const a = useContext(CartContext);
    function add() {
        a.addToCart(id);
        a.updateState(id);
    }
    function remove() {
        a.removeFromCart(id)
    }
    return (
        <>
        <div id="mainC">
            <img className="image" alt="null" src={link} ></img>
            <div id="Cont">
                <h1 className="inline h">
                    {name}</h1>
                <div id="fl-row">
                    <div id="block"><button className="px" onClick={remove} >-</button>
                        {a.cartItems[id]}
                        <button className="px" onClick={add}>+</button>
                    </div>
                    <div id="Light">$ {price} </div>
                    <div>$ {(price * a.cartItems[id]).toFixed(0)}</div></div>
            </div>
        </div>
                            <hr></hr></>
    )
}
export default AddedItem;