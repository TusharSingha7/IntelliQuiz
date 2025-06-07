
'use client'
import { useRouter } from "next/navigation";
import { useEffect, useRef , useState} from "react";
import React from "react";

export default function RoomPage({params} : {
    params : Promise<{room_id : string}>
}) {
    const {room_id} = React.use(params);
    const router = useRouter();
    const socket = useRef<WebSocket>(null);
    const [code,setCode] = useState<number>(0);

    useEffect(()=>{
        
        try {
            const client = new WebSocket('');
            socket.current = client;

            socket.current.addEventListener('open',(e)=>{
                console.log("connection Established");

            });

            socket.current.addEventListener('message',(e)=>{
                const message = e.data;

            })

            socket.current.addEventListener('close',(e)=>{
                console.log("connection closed");
            })

            socket.current.addEventListener('error',(e)=>{
                console.log(e);
            })
        }
        catch(e) {
            setCode(0);
            console.log(e);
        }

    })

    return <>
        <div className="flex">
            <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
                <span>Room Id : {room_id}</span>
            </div>
            <div className=" grow-[4] pr-5 flex justify-end p-2">
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg mr-2" onClick={()=>{
                    //do server side logic here  
                    router.push('/enter')
                }}>Exit</button>
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg" onClick={()=>{
                }}>
                    Start Quiz
                    </button>
            </div>
        </div>
        <div className="h-[100vh] bg-red-400">
            <ul className="flex flex-col items-center bg-red-800 p-2 rounded h-full overflow-y-auto w-full">
                <li>HI there</li>
                <li>HI there</li>
                <li>HI there</li>
                <li>HI there</li>
            </ul>
        </div>
    </>
}