

import { Dispatch, SetStateAction } from "react";

export default function JoinQuizPopup({func} : {
    func : Dispatch<SetStateAction<boolean>>
}) {
    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white rounded shadow shadow-lg">
        <div className="flex flex-col items-center">
            <input placeholder="Username" className="border w-56 border-black rounded font-bold p-2 my-2"></input>
            <input placeholder="Room Id" className="border w-56 border-black rounded font-bold p-2 my-2"></input>
            <button className="border w-56 border-black font-bold h-10 my-2 rounded">Join Quiz</button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
    </div>
    </> 
    
}