import { Link } from "react-router-dom";
import CartContext from "./Context/CartContext";
import "./item.css";
import { useContext } from "react";
function Item({type,name,price,link,id}){

    const a=useContext(CartContext);
    function AddCart(){
        a.updateState(id);
        a.addToCart(id);
    }
    return(
        <div className="item1">
            <div className="imgC">
            <img className="img1" src={`${link}`} alt="img"></img>
            <div className="box" id="box"><button id="plus" onClick={AddCart}>+</button><br></br><Link id="a" to={`/view/${id}`}><div id="eye">👁️</div></Link></div>
            </div>
            <h3>{type}</h3>
            <h2 className="head">{name}</h2>
            <h3><b>$</b> {price}</h3>
        </div>
    )
}
export default Item;