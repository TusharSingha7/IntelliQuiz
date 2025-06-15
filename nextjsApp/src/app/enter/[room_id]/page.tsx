'use client'
import { useRouter } from "next/navigation";
import { useEffect, useRef , useState} from "react";
import React from "react";
import MCQ from "@/components/mcq";
import { mcq_type } from "@/lib/index";
import Leaderboard from "@/components/leaderboard";
import FLeaderboard from "@/components/fLeaderboard";
import axios from "axios";
import LoadingUI from "@/components/loading";
import UnAuth from "@/components/unauthorized";
import {v4 as uuidv4} from 'uuid'

export default function RoomPage({params} : {
    params : Promise<{room_id : string}>
}) {
    const {room_id} = React.use(params);
    const router = useRouter();
    const socket = useRef<WebSocket>(null);
    const [question , setQuestion] = useState<mcq_type>({
        question : "default question afasdfasf asfdasfaf asfdasfasfdaas a fsasf",
        options : ['first' , 'second' , 'third' , 'fourth'],
        answer : 'third'
    });
    const [code,setCode] = useState<number>(-1);
    const [leaderboardDataTime , setLeaderBoardDataTime] = useState<{score : number, value : string}[]>([
        {value : '12_3' ,score : 5}
    ]);
    const [leaderboardDataScore , setLeaderBoardDataScore] = useState<{score : number , value : string}[]>([{
        value : '12_3' ,score : 400
    }]);
    const [userList,setUserList] = useState<object>({});
    const [showStarButton , setStartButton] = useState<boolean>(false);
    const [component , setComponent] = useState<React.JSX.Element>(<LoadingUI/>);
    const [user_id , setUserId] = useState<string>("default");
    const websocket = process.env.NEXT_PUBLIC_WEBSOCKET;

    useEffect(() => {
        if (code === 0) {
            socket.current?.close();
            socket.current = null;
            setComponent(<UnAuth/>)
        }
        else if(code == 1) {
            setComponent(<MCQ props={question} ref={socket} room_id={room_id} />)
        }
        else if(code == 2) {
            setComponent(<Leaderboard scoreList={leaderboardDataScore} timeList={leaderboardDataTime} userId={user_id.split('_')[0]} />)
        }
        else if(code == 3) {
            setComponent(<FLeaderboard scoreList={leaderboardDataScore} timeList={leaderboardDataTime} userId={user_id.split('_')[0]} />)
        }
        else if(code == 4) {
            setComponent(<PlayerList userList={userList} user_id={localStorage.getItem("intelli-quiz-userId")!} />)
        }
        
    }, [code, question, leaderboardDataScore, leaderboardDataTime, room_id, userList, user_id]);

    useEffect(()=>{

        try {
            if(!localStorage.getItem("intelli-quiz-userId")) {
                const id = crypto.randomUUID();
                localStorage.setItem("intelli-quiz-userId" , id);
            }
        }catch {
            const id = uuidv4();
            localStorage.setItem("intelli-quiz-userId" , id);
        }
        
        try {
            const id = `${localStorage.getItem("intelli-quiz-userId")}_${localStorage.getItem('username')}`;
            setUserId(id);
            const client = new WebSocket(`${websocket}:8080`);
            socket.current = client;
            socket.current.addEventListener('open',()=>{
                console.log("connection Established");
                socket.current!.send(JSON.stringify({
                code : 1,
                data : {
                    userId : id,
                    room_id : room_id,
                    ques : {}
                }
            }));

            });

            socket.current.addEventListener('message',(e)=>{
                const message = JSON.parse(e.data);
                // console.log(message);

                if(message.code == 4) {
                    //list came render the list
                    console.log(message.data);
                    setUserList(message.data)
                    setCode(4);
                    if (message.data && message.data[id] === "Host") {
                        setStartButton(true);
                    }
                }
                else if(message.code == 1) {
                    //a questino came render on screen 
                    const ques = message.data;
                    setQuestion(ques)
                    setCode(1);
                }
                else if(message.code == 2) {
                    //leaderboard
                    setLeaderBoardDataTime(message.data.leaderboardTime);
                    setLeaderBoardDataScore(message.data.leaderboardScore);
                    setCode(2);
                }
                else if(message.code == 3) {
                    //final leaderboard
                    setLeaderBoardDataTime(message.data.fleaderboardTime);
                    setLeaderBoardDataScore(message.data.fleaderboardScore);
                    setCode(3);
                }
                else if(message.code == 6) {
                    //unAuth
                    setCode(0);
                }

            })

            socket.current.addEventListener('close',()=>{
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
        return ()=>{
            socket.current?.close()
        }
    }, [room_id, websocket])

        return <>
        <div className="flex">
            <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
                <span>Room Id : {room_id}</span>
            </div>
            <div className=" grow-[4] pr-5 flex justify-end p-2">
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg mr-2" onClick={async ()=>{
                    //do server side logic here
                    try {
                        socket.current?.send(JSON.stringify({
                            code : 3,
                            data : {
                                userId : user_id
                            }
                        }));
                    }catch(error) {
                        console.log("sending error " +  error + user_id);
                    }
                    router.push('/enter')
                }}>Exit</button>
                {showStarButton && <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg" 
                onClick={async ()=>{
                    const response = await axios.post('/api/v2',{
                    userId : localStorage.getItem("intelli-quiz-userId"),
                    code : 3,
                    username : localStorage.getItem('username'),
                    topicDescription : "",
                    room_id : room_id,
                    questionsCount : 0
                });
                if(response) setStartButton(false);
                }}>
                    Start Quiz
                    </button>}
            </div>
        </div>
        <div className="h-screen relative">
            {component}
        </div>
    </>
    
}

function PlayerList({userList , user_id} : {userList : object , user_id : string}) {
    return <>
    <div className="font-bold text-4xl text-center border-y-2 p-2">Waiting List</div>
    <li  className="grid grid-cols-2 text-center text-2xl font-bold p-2 border-b-2">
                <span> Candidate </span>
                <span> Role </span>
            </li>
    <ul className="grid items-center p-2 rounded overflow-y-auto text-2xl">
        {Object.entries(userList).map(([user, role]) => (
            <li key={user} className={`rounded grid grid-cols-2 text-center ${
                        user.split('_')[0] === user_id ? "bg-green-400" : "bg-white"
                        }`}>
                <span> {user.split('_')[1]} </span>
                <span> {role} </span>
            </li>
        ))}
    </ul>
    </>

}