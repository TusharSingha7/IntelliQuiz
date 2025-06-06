'use client'
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction , useState} from "react";

export default function CreateQuizPopup({func} : {
    func : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>("");
    const [topicName,setTopicName] = useState<string>("");
    const [count,setCount] = useState<number>(0);
    const router = useRouter();

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-gray-300 rounded shadow shadow-lg">
        <div className="flex flex-col items-center">
            <input placeholder="Username" onChange={(e)=>{setUsername(e.target.value)}} required={true} className="border w-56 border-black rounded font-bold p-2 my-2"></input>
            <input placeholder="Topic Name" onChange={(e)=>{setTopicName(e.target.value)}} required={true} className="border rounded w-56 border-black my-2 font-bold p-2"></input>
            <input placeholder="No of questions" onChange={(e)=>{setCount(Number(e.target.value))}} type="Number"defaultValue={10} className="border rounded w-56 border-black my-2 font-bold p-2"></input>
            <button className="border w-56 border-black font-bold h-10 my-2 rounded" onClick={()=>{
                //fetch room id from backend and join this player 
                const room_id = 'in635253'
                router.push(`/enter/${room_id}`);
            }}>Create Quiz</button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
    </div>
    </> 
    
}