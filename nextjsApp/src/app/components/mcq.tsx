'use client'
import { useEffect, useState , useRef } from "react"
import { mcq_type } from "../lib"
import ProgressBar from "./progressbar"
import { Button } from "@/src/components/ui/button";

export default function MCQ({props , ref ,room_id} : {props : mcq_type , ref : React.RefObject<WebSocket | null> ,room_id : string}){

    const userId = `${localStorage.getItem("intelli-quiz-userId")}_${localStorage.getItem('username')}`;
    const clickedCheck = useRef(false);
    const [option , setOption] = useState<number>(-1);
    const [answered , setAnswered] = useState<boolean>(false);
    useEffect(() => {
        setOption(-1);
        clickedCheck.current = false;
    }, [props.question]);
    const onClickHandler = (index : number)=> {
        if(clickedCheck.current == true) return;
        clickedCheck.current = true;
        const socket = ref.current;
        socket?.send(JSON.stringify({
            code : 2,
            data : {
                ans : props.options[index],
                ques : props,
                userId : userId,
                room_id : room_id
            }
        }))

    }
    return (<>
        <div className="min-h-full pb-10">
            <div className="w-[70%] min-h-[70%] flex flex-col items-center rounded-lg shadow-xl border mx-auto">
                <div className="text-4xl font-bold border p-2 rounded text-center">
                    <div>{props.question}</div><br/>
                    <ProgressBar resetkey={props.question} key={props.question} />
                </div>
                <div className="flex flex-col w-full ">
                    {props.options.map((value , index)=>{
                        return <Button variant={"ghost"} key={index} className={`text-left text-3xl border m-2 p-5 rounded ${option == index ? "bg-[#640df2] text-white" : "bg-white"} whitespace-normal break-words`} 
                        onClick={()=>{
                            setOption(index);
                            setAnswered(true);
                            onClickHandler(index);
                        }} disabled = {answered} > {value}</Button>
                    })}
                </div>
            </div>
        </div>
    </>)
}