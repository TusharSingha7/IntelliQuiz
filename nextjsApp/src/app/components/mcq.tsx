'use client'
import { useState } from "react"
import { mcq_type } from "../lib"
import ProgressBar from "./progressbar"

export default function MCQ({props , ref ,room_id} : {props : mcq_type , ref : React.RefObject<WebSocket | null> ,room_id : string}){
    const [status,setStatus] = useState<boolean>(false);
    const [option , setOption] = useState<number>(0);
    const onClickHandler = ()=> {

        if(status == true) return;
        setStatus(true);
        const socket = ref.current;
        socket?.send(JSON.stringify({
            code : 2,
            data : {
                ans : props.options[option],
                ques : props,
                userId : `${localStorage.getItem("intelli-quiz-userId")}_${localStorage.getItem('username')}`,
                room_id : room_id
            }
        }))

    }
    return (<>
        <div className="min-h-full pb-10">
            <div className="w-[70%] h-[70%] flex flex-col items-center rounded-lg shadow-xl border mx-auto">
                <div className="text-4xl font-bold border p-2 rounded text-center">
                    <div>{props.question}</div><br/>
                    <ProgressBar resetkey={props.question} key={props.question} />
                </div>
                <div className="flex flex-col w-full ">
                    <button className="text-left text-3xl border m-2 p-2 rounded" onClick={()=>{
                        setOption(0);
                        onClickHandler();
                    }}>{props.options[0]}</button>
                    <button className="text-left text-3xl border m-2 p-2 rounded" onClick={()=>{
                        setOption(1);
                        onClickHandler();
                    }}>{props.options[1]}</button>
                    <button className="text-left text-3xl border m-2 p-2 rounded" onClick={()=>{
                        setOption(2);
                        onClickHandler();
                    }}>{props.options[2]}</button>
                    <button className="text-left text-3xl border m-2 p-2 rounded" onClick={()=>{
                        setOption(3);
                        onClickHandler();
                    }}>{props.options[3]}</button>
                </div>
            </div>
        </div>
    </>)
}