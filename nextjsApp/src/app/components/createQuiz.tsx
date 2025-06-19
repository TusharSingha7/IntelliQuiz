'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction , useState} from "react";
import { Button } from '@/src/components/ui/button'
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";

export default function CreateQuizPopup({func , loader} : {
    func : Dispatch<SetStateAction<boolean>>,
    loader : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>(localStorage.getItem('username') || "");
    const [topicDescription,setTopicName] = useState<string>("");
    const [count,setCount] = useState<number>(10);
    const router = useRouter();

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white rounded shadow shadow-lg h-[70%] w-[50%] flex items-center justify-center">
        <div className="flex flex-col">
            <Label htmlFor="username" className="py-2">Username</Label>
            <Input id="username" placeholder="Engineer" defaultValue={localStorage.getItem('username') || ""} onChange={(e)=>{setUsername(e.target.value)}} required={true} className="border w-72 shadow rounded font-bold p-2 my-2"></Input>
            <Label htmlFor="topic" className="py-2">Topic Description</Label>
            <Textarea id="topic" placeholder="Databases" onChange={(e)=>{setTopicName(e.target.value)}} required={true} className="border rounded w-72 shadow my-2 font-bold p-2"></Textarea>
            <Label htmlFor="counter" className="py-2">Questions Count</Label>
            <Input id="counter" placeholder="No of questions" onChange={(e)=>{setCount(Number(e.target.value))}} type="Number"defaultValue={10} className="border rounded w-72 shadow my-2 font-bold p-2"></Input>
            <Button variant={"ghost"} className="border w-72 shadow bg-black text-white font-bold h-10 my-2 rounded" onClick={async ()=>{
                //fetch room id from backend and join this player
                //call for room creation here
                loader(true);
                localStorage.setItem('username' , username);
                if(username.length < 1) {
                    alert("invalid username");
                    loader(false);
                }
                else {
                    try {
                        const response = await axios.post('/api/v2',{
                        userId : localStorage.getItem("intelli-quiz-userId"),
                        code : 1,
                        username : username,
                        topicDescription : topicDescription,
                        room_id : null,
                        questionsCount : count
                        });
                        console.log("done with response")
                        if(response && response.data.code) {
                            const room_id = response.data.roomId;
                            router.push(`/enter/${room_id}`);
                        }
                        else {
                            alert(response.data.message);
                            loader(false);
                        }
                    } catch {
                        alert("please try again later");
                        loader(false);
                    }
                    
                }
                
            }}>Create Quiz</Button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
    </div>
    </> 
    
}