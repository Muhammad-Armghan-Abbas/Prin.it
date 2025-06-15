import { useState, useEffect } from "react";
import CartContext from "./CartContext";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const CartState = (props) => {
    const [state, setState] = useState(0);
    const [item, setItem] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [userId, setUserId] = useState(null);

    // Fetch initial products
    useEffect(() => {
        const fetchData = async () => {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setItem(items);
            // Initialize cart with fetched products
            const initialCart = {};
            items.forEach(product => {
                initialCart[product.id] = 0;
            });
            setCartItems(prev => ({ ...initialCart, ...prev }));
        };
        fetchData();
    }, []);

    // Add useEffect to track cartItems changes
    useEffect(() => {
        updateState();
    }, [cartItems]);

    function updateState(id) {
        // Calculate total number of items in cart
        const newState = Object.values(cartItems).reduce((acc, curr) => acc + (curr || 0), 0);
        setState(newState);
    }

    function getTotal() {
        let total = 0;
        for (const obj in cartItems) {
            if (cartItems[obj] > 0) {
                const itemInfo = item.find((it) => it.id === obj || it.id === Number(obj));
                if (itemInfo) {
                    // Calculate price based on whether item is customized
                    const itemPrice = itemInfo.customization 
                        ? parseFloat(itemInfo.price) + (itemInfo.customization.customizationFee || 5.00)
                        : parseFloat(itemInfo.price);
                    total += cartItems[obj] * itemPrice;
                }
            }
        }
        return total;
    }

    const getDefault = () => {
        const cart = {};
        item.forEach(product => {
            cart[product.id] = 0;
        });
        return cart;
    };    const addToCart = (product) => {
        // If product is an ID (regular product)
        if (typeof product === 'number' || typeof product === 'string') {
            setCartItems((prev) => {
                const newCart = { ...prev, [product]: (prev[product] || 0) + 1 };
                updateState(); // Update state immediately
                return newCart;
            });
            return product;
        }

        // If product is a customized product object
        const customProductId = `custom_${product.id}_${Date.now()}`;
        const customizedProduct = {
            ...product,
            id: customProductId,
            originalId: product.id,
            price: product.price || 0,
            finalPrice: (parseFloat(product.price) || 0) + (product.customization?.customizationFee || 5.00),
            quantity: 1
        };

        // Add to items array and cart
        setItem(prevItems => [...prevItems, customizedProduct]);
        setCartItems(prev => {
            const newCart = { ...prev, [customProductId]: 1 };
            updateState(); // Update state immediately
            return newCart;
        });
        return customProductId;
    };

    const removeFromCart = (id) => {
        setCartItems((prev) => {
            const newQty = (prev[id] || 0) - 1;
            let newCart = { ...prev };
            
            if (newQty <= 0) {
                delete newCart[id];
                // Remove customized product from items if applicable
                if (id.toString().startsWith('custom_')) {
                    setItem(prevItems => prevItems.filter(item => item.id !== id));
                }
            } else {
                newCart[id] = newQty;
            }
            
            setTimeout(() => updateState(), 0);
            return newCart;
        });
    };

    // Clear cart function
    const clearCart = () => {
        // Remove all customized products from items
        setItem(prevItems => prevItems.filter(item => !item.id.toString().startsWith('custom_')));
        setCartItems(getDefault());
        setState(0);
    };

    return (
        <CartContext.Provider value={{
            item,
            state,
            updateState,
            setState,
            setCartItems,
            addToCart,
            removeFromCart,
            cartItems,
            getTotal,
            getDefault,
            userId,
            setUserId,
            clearCart
        }}>
            {props.children}
        </CartContext.Provider>
    );
};

export default CartState;