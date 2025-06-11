'use client'
import { useRouter } from "next/navigation";
import { useEffect, useRef , useState} from "react";
import React from "react";
import MCQ from "../../components/mcq";
import { mcq_type } from "../../lib";
import Leaderboard from "../../components/leaderboard";
import FLeaderboard from "../../components/fLeaderboard";
import axios from "axios";
import UnAuth from "../../components/unauthorized";

export default function RoomPage({params} : {
    params : Promise<{room_id : string}>
}) {
    const {room_id} = React.use(params);
    const router = useRouter();
    const socket = useRef<WebSocket>(null);
    const [question , setQuestion] = useState<mcq_type>({
        question : "default question",
        option1 : "A",
        option2 : "B",
        option3 : "C",
        option4 : "D"
    });
    const [code,setCode] = useState<number>(0);
    const [showLeader , setShowLeader] = useState<boolean>(false);
    const [leaderboardDataTime , setLeaderBoardDataTime] = useState({});
    const [leaderboardDataScore , setLeaderBoardDataScore] = useState({});
    const [userList,setUserList] = useState<object>({});
    const [showStarButton , setStartButton] = useState<boolean>(false);

    let user_id : string;

    useEffect(()=>{
        
        try {
            user_id = localStorage.getItem("intelli-quiz-userId") + '_' + localStorage.getItem('username');
            const client = new WebSocket('ws://localhost:8080');
            socket.current = client;
            socket.current.addEventListener('open',(e)=>{
                console.log("connection Established");
                socket.current!.send(JSON.stringify({
                code : 1,
                data : {
                    userId : `${localStorage.getItem("intelli-quiz-userId")}_${localStorage.getItem('username')}`,
                    room_id : room_id,
                    ques : {}
                }
            }));

            });

            socket.current.addEventListener('message',(e)=>{
                const message = JSON.parse(e.data);
                console.log(message);

                if(message.code == 4) {
                    //list came render the list
                    console.log(message.data);
                    setUserList(message.data)
                    setCode(4);
                    if (message.data && message.data[user_id] === "Host") {
                        setStartButton(true);
                    }
                }
                else if(message.code == 1) {
                    //a questino came render on screen 
                    const ques = message.data;
                    setQuestion({
                        question : ques.question,
                        option1 : ques.options[0],
                        option2 : ques.options[1],
                        option3 : ques.options[2],
                        option4 : ques.options[3],
                    })
                    setCode(1);
                    setShowLeader(false);
                }
                else if(message.code == 2) {
                    //leaderboard
                    setLeaderBoardDataTime(message.data.leaderboardTime);
                    setLeaderBoardDataScore(message.data.leaderboardScore);
                    setShowLeader(true);
                    setCode(1);
                }
                else if(code == 3) {
                    //final leaderboard
                    setLeaderBoardDataTime(message.data.fleaderboardTime);
                    setLeaderBoardDataScore(message.data.fleaderboardScore);
                    setCode(2);
                }

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
        return ()=>{
            socket.current?.close()
        }
    },[])

    if(code == 1) {
        //render question here on which user can click
        return <>
            {showLeader && <Leaderboard/>}
            <MCQ props={question} />
        </>
    }

    else if(code == 2) {
        //render final leaderboard
        return <FLeaderboard/>
    }
    else if(code == 4) {
        return <>
        <div className="flex">
            <div className="font-bold text-2xl p-2 grow-[6] pr-10 flex justify-end items-center">
                <span>Room Id : {room_id}</span>
            </div>
            <div className=" grow-[4] pr-5 flex justify-end p-2">
                <button className="px-4 border border-black rounded py-2 font-bold shadow shadow-lg mr-2" onClick={async ()=>{
                    //do server side logic here  
                    try {
                            const response = await axios.post('/api/v2',{
                            userId : localStorage.getItem("intelli-quiz-userId"),
                            code : 4,
                            username : localStorage.getItem('username'),
                            topicDescription : "",
                            room_id : room_id,
                            questionsCount : 0
                            })
                    }catch(error) {
                        console.log(error);
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
                }}>
                    Start Quiz
                    </button>}
            </div>
        </div>
        <div className="h-[100vh] bg-red-400">
            <ul className="flex flex-col items-center bg-red-800 p-2 rounded h-full overflow-y-auto w-full">
                {Object.entries(userList).map(([user, role]) => (
                    <li key={user}>{user} ({role})</li>
                ))}
            </ul>
        </div>
    </>
    }

    else {
        return <UnAuth/>
    }

    
}
