import { useContext } from "react";
import "./addedItem.css";
import CartContext from "./Context/CartContext";

function AddedItem({ item, type, name, price, link, id, customization }) {
    const a = useContext(CartContext);
    
    // Handle both ways of receiving props
    const itemData = item || {
        id: id,
        title: name,
        category: type,
        price: price,
        image: link,
        customization: customization
    };
    
    const basePrice = parseFloat(itemData.price || price);
    const customFee = (itemData.customization || customization) ? 5.00 : 0;
    const totalPrice = basePrice + customFee;
      function add() {
        if (!itemData.customization) {  // Only allow incrementing non-customized products
            a.addToCart(itemData.id);
            a.updateState(itemData.id);
        }
    }
    
    function remove() {
        a.removeFromCart(itemData.id);
    }
      const { cartItems } = useContext(CartContext);
    const quantity = cartItems[itemData.id] || 0;

    const handleRemoveItem = () => {
        a.setCartItems(prev => ({
            ...prev,
            [itemData.id]: 0
        }));
        a.setState(prev => Math.max(0, prev - quantity));
    };

    return (
        <div className="added-item">
            <div className="added-item-image">
                {itemData.customization ? (
                    <img src={itemData.customization.previewImage} alt={itemData.title || itemData.name} className="customized-preview" />
                ) : (
                    <img src={itemData.image} alt={itemData.title || itemData.name} />
                )}
            </div>
            <div className="added-item-details">
                <h3>{itemData.title || itemData.name}</h3>
                <p className="price">${totalPrice.toFixed(2)}</p>
                {itemData.customization && (
                    <div className="customization-details">
                        <p className="customization-tag">Customized</p>
                        <p className="customization-fee">Customization fee: $5.00</p>
                    </div>
                )}
                <div className="item-controls">
                    <div className="quantity-controls">
                        <button onClick={remove} disabled={quantity <= 1}>-</button>
                        <span>{quantity}</span>
                        <button onClick={add} disabled={!!itemData.customization}>+</button>
                    </div>
                    <button className="remove-item" onClick={handleRemoveItem}>
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AddedItem;