import { useContext} from "react";
import "./header.css";
import CartContext from "./Context/CartContext";
import { Bag } from "./Context/Bag";
import { Link } from "react-router-dom";
function Header(){
    const b=useContext(Bag);
    function upd(){
        b.update();
    }
    const a=useContext(CartContext);
return(<header><nav>
    <div className="container">
   <Link to={'/'}><img className="w40" src="https://store-giga.vercel.app/static/media/logo.602f42bc5247b6c8fc88dcf001c1a477.svg" alt="Logo"></img></Link>
   <button className="float w40" onClick={upd}>🛒<div className="cart">{a.state}</div></button></div></nav>
    </header>);
}
export default Header;