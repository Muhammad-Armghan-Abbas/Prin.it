import { createContext, useState } from "react";

export const Bag=createContext();
const BagC=(props)=>{
    const [open,setOpen]=useState(true);
    const [id,setid]=useState(null);
    function update(){
       open===false?setOpen(true):setOpen(false);
    }
    
    return(
        <Bag.Provider value={{open,update,id,setid}}>{props.children}</Bag.Provider>
    )
}
export default BagC;