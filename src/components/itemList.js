import { useContext } from 'react';
import Item from './item.js'
import CartContext from './Context/CartContext.js';
function ItemList() {
const a=useContext(CartContext);
const items=a.item;
const filteredProducts = items.filter(item => {
    return item.category === "men's clothing" || item.category === "women's clothing"
  })
    return (
        <>{
            filteredProducts.map(it => <Item
                type={it.category}
                name={it.title}
                price={it.price}
                link={it.image}
                id={it.id}
                key={it.id}
            ></Item>)
        }
        </>
    )
}
export default ItemList;