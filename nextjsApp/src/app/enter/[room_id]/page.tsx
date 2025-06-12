'use client'
import { useRouter } from "next/navigation";
import { useEffect, useRef , useState} from "react";
import React from "react";
import MCQ from "../../components/mcq";
import { mcq_type } from "../../lib";
import Leaderboard from "../../components/leaderboard";
import FLeaderboard from "../../components/fLeaderboard";
import axios from "axios";
import LoadingUI from "../../components/loading";

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
    const [code,setCode] = useState<number>(1);
    const [showLeader , setShowLeader] = useState<boolean>(false);
    const [leaderboardDataTime , setLeaderBoardDataTime] = useState<{score : number, value : string}[]>([
        {value : '12_3' ,score : 5}
    ]);
    const [leaderboardDataScore , setLeaderBoardDataScore] = useState<{score : number , value : string}[]>([{
        value : '12_3' ,score : 400
    }]);
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
                    setQuestion(ques)
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
                    setShowLeader(false);
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
                            userId : `${localStorage.getItem("intelli-quiz-userId")}_${localStorage.getItem('username')}`
                        }));
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
                if(response) setStartButton(false);
                }}>
                    Start Quiz
                    </button>}
            </div>
        </div>
        <div className="h-screen relative">
            {code == 4 ? (
                <ul className="flex flex-col items-center bg-red-800 p-2 rounded h-full overflow-y-auto w-full">
                    {Object.entries(userList).map(([user, role]) => (
                        <li key={user}>{user} ({role})</li>
                    ))}
                </ul>
            ) : code == 1 ? (<>
                {showLeader && <Leaderboard scoreList={leaderboardDataScore} timeList={leaderboardDataTime} userId={localStorage.getItem("intelli-quiz-userId")!} />}
                {!showLeader && <MCQ props={question} ref={socket} key={question.question} room_id={room_id} />}
            </>) : code == 2 ? <FLeaderboard scoreList={leaderboardDataScore} timeList={leaderboardDataTime} userId={localStorage.getItem("intelli-quiz-userId")!}/> : <LoadingUI/>}
        </div>
    </>
    
}
