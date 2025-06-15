import { useContext } from "react";
import "./View.css";
import { useParams } from "react-router-dom";
import CartContext from "../Context/CartContext.js";
function View() {
  const a = useContext(CartContext);
  const { id } = useParams();
  function add() {
    a.updateState(id);
    a.addToCart(id);
    console.log(id);
  }
  const product = a.item.find(it => it.id === parseInt(id));

  if (!product) {
    return (
      <section className='h-screen flex justify-center items-center'>Loading...</section>
    );
  }
  const { title, price, description, image } = product;
  return (
    <>
            <div className="flex">
              <div>
                <img id="image" src={`${image}`} alt="img"></img>
              </div>
              <div id="blocked">
                <h4>{title}</h4>
                <h5>$ {price}</h5>
                <h3>{description}</h3>
                <button id="ADC" onClick={add}>Add To Cart</button>
              </div>
            </div>
          </>
  )
}
export default View;