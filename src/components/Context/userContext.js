import { createContext, useState } from "react";
export const user=createContext;
const UserContext=(props)=>{
    const [userId, setUserId] = useState(null);
    return(
    <user.provider value={{userId,setUserId}}>{props.children}</user.provider>
)
}
export default UserContext;