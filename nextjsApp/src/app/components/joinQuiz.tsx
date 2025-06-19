'use client'

import { Dispatch, SetStateAction } from "react";
import {useState} from 'react'
import { useRouter } from "next/navigation";
import axios from "axios";
import {Button} from '@/src/components/ui/button'
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

export default function JoinQuizPopup({func , loader} : {
    func : Dispatch<SetStateAction<boolean>>,
    loader : Dispatch<SetStateAction<boolean>>
}) {
    const [username,setUsername] = useState<string>(localStorage.getItem('username') || "");
    const [roomid,setRoomid] = useState<string>("");
    const router = useRouter();

    return <>
    <div className="z-20 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-8 bg-white rounded shadow shadow-lg h-[70%] w-[50%] flex items-center justify-center">
        <div className="flex flex-col">
            <Label htmlFor="username" className="py-2">Username</Label>
            <Input id="username" placeholder="Engineer" defaultValue={localStorage.getItem('username') || ""} required={true} className="border w-72 rounded shadow font-bold p-2 my-2" onChange={(e)=>{setUsername(e.target.value)}}></Input>
            <Label htmlFor="roomId" className="py-2">Room Id</Label>
            <Input id="roomId" placeholder="123456" required={true} className="border w-72 shadow rounded font-bold p-2 my-2" onChange={(e)=>{setRoomid(e.target.value)}}></Input>
            <Button variant={'ghost'} className="border w-72 shadow bg-black text-white font-bold h-10 my-2 rounded" onClick={async ()=>{
                //perfomr server side logic here
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
                            code : 2,
                            username : username,
                            topicDescription : "",
                            room_id : roomid,
                            questionsCount : 0
                        });
                        if(response && response.data.code) {
                            router.push(`/enter/${roomid}`)
                        }
                        else {
                            alert(response.data.message);
                            loader(false);
                        }

                    }catch{
                        alert("please try again later");
                        loader(false);
                    }
                }

            }}>Join Quiz</Button>
        </div>
    </div>
    <div onClick={()=>{
        func(false);
    }} className="z-10 opacity-50 h-full w-full fixed bg-gray-400 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

    </div>
    </> 
    
}