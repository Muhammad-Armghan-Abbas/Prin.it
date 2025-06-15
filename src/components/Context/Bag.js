import { createContext, useState } from "react";

export const Bag=createContext();
const BagC=(props)=>{
    const [open,setOpen]=useState(false);
    const [id,setid]=useState(null);
    function update(){
        setOpen(prev => !prev);
    }
    
    return(
        <Bag.Provider value={{open,update,id,setid}}>{props.children}</Bag.Provider>
    )
}
export default BagC;