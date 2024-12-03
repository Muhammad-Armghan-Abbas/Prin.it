import { useState,useEffect } from "react";
import CartContext from "./CartContext";
const CartState=(props)=>{
    const [state,setState]=useState(0);
    function updateState(id){
        setState(state+1);
    }
    const [item,setItem]=useState([]);
    useEffect(() => {
        const GetData = async() => {
           const response =await fetch('https://fakestoreapi.com/products');
              const data= await response.json();
                setItem(data);
        }
        GetData();
    }, [])
    const getDefault=()=>{
        let cart ={}
        for(let i=1;i<=20;i++){
            cart[i]=0;
        }
        return cart;
    }
    const[cartItems,setCartItems]=useState(getDefault)
    function getTotal(){
        let total=0;
        for(const obj in cartItems){
            if(cartItems[obj]>0){
               let itemInfo=item.find((it)=>it.id===Number(obj));
               total+=cartItems[obj]*itemInfo.price;
            }
        }
        return total;
    }
    const addToCart=(id)=>{
        setCartItems((prev)=>({...prev,[id]:prev[id]+1}))
    }
    const removeFromCart=(id)=>{
        setCartItems((prev)=>({...prev,[id]:prev[id]-1}))
        setState(state-1);
    }
    const [userId, setUserId] = useState(null);
    return(
        <CartContext.Provider value={{item,state,updateState,setState,setCartItems,addToCart,removeFromCart,cartItems,getTotal,getDefault,userId, setUserId}}>{props.children}</CartContext.Provider>
    )
}
export default CartState;