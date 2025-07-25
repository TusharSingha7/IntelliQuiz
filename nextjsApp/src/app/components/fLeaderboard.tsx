import VantaBackground from "./birdsBack";


export default function FLeaderboard({timeList , scoreList , userId } : {
    timeList : {value : string , score : number}[],
    scoreList: {value : string , score : number}[],
    userId : string
}) {
    const timeMap = new Map<string,number>();

    for(let i = 0;i<timeList.length;i++) {
        const value = timeList[i].value;
        const score = timeList[i].score;
        timeMap.set(value,score);
    }
    
    return (<VantaBackground value="DOTS">
    <div className=" min-h-screen flex flex-col  rounded justify-start text-white ">
            <h1 className="text-center text-4xl font-bold block p-5">Final Leaderboard</h1>
                <ol className="grid w-full p-5 items-center rounded">
                    <li className="grid grid-cols-4 text-2xl w-full justify-start rounded pb-2 font-bold">
                        <span className="text-center" >Rank</span>
                        <span className="text-center" >Player</span>
                        <span className="text-center">Score</span>
                        <span className="text-center">Time Taken</span>
                    </li>
                    
                    {scoreList.map((ele , index) => { 
                    const [user_id, username] = ele.value.split('_');

                    return (
                    <li
                        key={ele.value}
                        className={`grid grid-cols-4 text-2xl w-full justify-start rounded ${
                        userId === user_id ? "bg-green-400/50 " : ""
                        }`}
                    >
                        <span className="text-center font-bold">{index + 1}</span>
                        <span className="text-center" >{username}</span>
                        <span className="text-center">{ele.score}</span>
                        <span className="text-center">{timeMap.get(ele.value)}</span>
                    </li>
                    );
                })}
                
            </ol>
        </div>
        </VantaBackground>)
}