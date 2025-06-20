import { WebSocketServer, WebSocket } from 'ws';
import {createClient} from 'redis'
import {createServer} from 'http'
import 'dotenv/config'

interface communication {
    code : number,
    data : any
}

const server = createServer();
const redisPassword = process.env.PASSWORD;
const serverSocket = new WebSocketServer({server});

const subscriber = createClient({
    username: 'default',
    password: redisPassword,
    socket: {
        host: 'redis-17753.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 17753
    }
});
const client = createClient({
    username: 'default',
    password: redisPassword,
    socket: {
        host: 'redis-17753.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 17753
    }
});
const socketMap = new Map<string,WebSocket>();
const userMap = new Map<WebSocket,string>();
const subscribedChannels = new Set<string>();
const roomMemberCount = new Map<string,number>();
const room_map = new Map<string,string>();

let flag = true;

subscriber.on('error', (err) => {
  console.error("Redis Subscriber Error:", err);
});

client.on('error', (err) => {
  console.error("Redis Client Error:", err);
});

subscriber.on('end', () => {
    console.warn("Redis subscriber disconnected. Attempting to reconnect...");
    subscriber.connect().catch(console.error);
});

client.on('end', () => {
    console.warn("Redis client disconnected. Attempting to reconnect...");
    client.connect().catch(console.error);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});


async function main() {
    try {

    if (!client.isOpen) await client.connect();
    if (!subscriber.isOpen) await subscriber.connect();

    }catch(err){
        console.log(err);
    }
    
}
main()

function pushList(list : {
    [x: string] : string
}) {
    // console.log(list);
     for(const id in list) {
        // console.log(id);
        const socket = socketMap.get(id);
        if(socket && socket.OPEN) {
            socket.send(JSON.stringify({
                code : 4,
                data : list
            }))
        }
    }
}

async function subscribeHandler(res : communication) {
    //push the message to the socket of the userId
    //get the socket from the map and push to the user
    //it can be leaderboard or question
    //get the list of users from clinet connected to the room
    try {

        subscriber.subscribe(res.data.room_id,async (message,channel)=>{

    const list = await client.hGetAll(`${channel}:clients`);
    const data = JSON.parse(message);
        let check = false;
        flag = false;
        for(const ques in data) {
            const org = data[ques];
            // console.log(org);
            for(const id in list) {
                const socket = socketMap.get(id);
                if(socket && socket.OPEN) {
                    socket.send(JSON.stringify({
                        code : 1,
                        data : org
                    }));
                    client.hSet(`${id}:quesTime`,JSON.stringify(org),JSON.stringify(new Date()));
                }
            }
            //wait 5 sec
            await new Promise((res)=>{
                setTimeout(res,8000);
            })
            //push leaderboard and wait for 2 sec 
            const leaderboardTime = await client.zRangeWithScores(`${res.data.room_id}:leaderboardTime`, 0, -1,{REV:true});
            const leaderboardScore = await client.zRangeWithScores(`${res.data.room_id}:leaderboardScore`, 0, -1,{REV:true});

            for(const id in list) {
                const socket = socketMap.get(id);
                if(socket && socket.OPEN) {
                    socket.send(JSON.stringify({
                        code : 2,
                        data : {
                            leaderboardScore,
                            leaderboardTime
                        }
                    }));
                }
            }
            await new Promise((res)=>{
                setTimeout(res,4000);
            });

            //reset the leaderboard now 
            const leaderboardTimeList = await client.zRange(`${res.data.room_id}:leaderboardTime`, 0, -1);
            const leaderboardScoreList = await client.zRange(`${res.data.room_id}:leaderboardScore`, 0, -1);
            if(leaderboardScoreList.length == 0 || leaderboardTimeList.length == 0) {
                check = true;
                break;
            }
            await client.zAdd(`${res.data.room_id}:leaderboardScore`, leaderboardScoreList.map((member)=>({value : member , score : 0})));
            await client.zAdd(`${res.data.room_id}:leaderboardTime`, leaderboardTimeList.map((member)=>({value : member , score : 0})));

        }
        //push the final leaderboard
        const fleaderboardTime = await client.zRangeWithScores(`${res.data.room_id}:finalLeaderboardTime`,0,-1,{REV:true});
        const fleaderboardScore = await client.zRangeWithScores(`${res.data.room_id}:finalLeaderboardScore`,0,-1,{REV:true});
        let hostId : string;
        for(const id in list) {
            if(check) break;
            if(list[id] == "Host") hostId = id;
            const socket = socketMap.get(id);
            if(socket && socket.OPEN) {
                socket.send(JSON.stringify({
                    code : 3,
                    data : {
                        fleaderboardScore,
                        fleaderboardTime
                    }
                }));
            }
        }

        flag = true;
        const room_detail = await client.get(channel);
        if(room_detail) {
            const tdata = JSON.parse(room_detail); 
            await client.set(`${channel}`,JSON.stringify({
                userId : tdata.userId,
                status : false,
                count : tdata.count
            }));
        }

    })

    }catch(err) {
        console.log(err);
    };
        
}

async function exitHandler(userId : string) {

    try {
        const response = await client.get(userId);
    if(response) {
        //delete the user entry 
        await client.del(userId);
        //remove from clinets , leaderboards ( time and score , final and normal)
        //delete the room if room becomes empty 
        await client.hDel(`${response}:clients`,userId);
        //remove from leaderboards
        await client.zRem(`${response}:leaderboardScore`, userId);
        await client.zRem(`${response}:finalLeaderboardScore`, userId);
        await client.zRem(`${response}:leaderboardTime`, userId);
        await client.zRem(`${response}:finalLeaderboardTime`, userId);
        //delete the room if host leaves the room 
        const room_detail = await client.get(`${response}`);
        const data = JSON.parse(room_detail!);
        if(data.userId == userId) {
            //delete the room host left the room
            await client.del(`${response}:leaderboardScore`);
            await client.del(`${response}:finalLeaderboardScore`);
            await client.del(`${response}:leaderboardTime`);
            await client.del(`${response}:finalLeaderboardTime`);
            const clinetsList = await client.hGetAll(`${response}:clients`)
            await client.del(`${response}:clients`);
            await client.del(`${response}:list`);
            await client.del(`${response}`);
            //delete entries for all clinets also 
            for(const id in clinetsList) {
                const socket = socketMap.get(id);
                if(socket && socket.OPEN) {
                    socket.send(JSON.stringify({
                        code : 7,
                        data : {

                        }
                    }))
                }
                await client.del(id);
            }
        } 
        else {
            //decrease the count
            const room_detail = await client.get(`${response}`);
            const data = JSON.parse(room_detail!);
            // console.log(room_detail);
            await client.set(response,JSON.stringify({
                status : data.status,
                userId : data.userId,
                count : data.count - 1
            }));
            //push the updated list
            const list = await client.hGetAll(`${response}:clients`);
            if(flag) pushList(list);
        }

    } 
    }catch(err) {
        console.log(err);
    }
}

async function responseSubmitHandler(userId:string , ques : {
    question : string,
    options : string[],
    answer : string
} , ans : string , room_id : string) {
    try {
        const data = await client.hGet(`${userId}:quesTime`,JSON.stringify(ques));

    await client.del(`${userId}:quesTime`)
    if(data){
        const timeSent = JSON.parse(data);
        const time = new Date(timeSent);
        const timeDiff = Math.abs(time.getTime() - (new Date()).getTime());
        const timeInSeconds = (timeDiff / 1000);
        const lostScore = 125*timeInSeconds;
        let newScore = Math.max(0,1000 - lostScore);
        //match the answer
        if(ans != ques.answer) newScore = 0;
        // console.log(newScore);
        //update the leaderboard score accordingly
        await client.zAdd(`${room_id}:leaderboardTime`,{
            value : userId,
            score : timeInSeconds
        });
        await client.zAdd(`${room_id}:leaderboardScore`,{
            value : userId,
            score : newScore
        })
        await client.zIncrBy(`${room_id}:finalLeaderboardScore`,newScore,userId)
        await client.zIncrBy(`${room_id}:finalLeaderboardTime`,timeInSeconds,userId)
    }

    }catch(err) {
        console.log(err)
    }
    
}


serverSocket.on('connection',async (clientSocket : WebSocket)=>{

    clientSocket.onmessage = async (message)=>{
        const res : communication = JSON.parse(
            typeof message.data === 'string'
                ? message.data
                : message.data.toString()
        );

        try {
            if(res.code == 1) {
            //check connection authenticity
            //userId , roomId , verify this data from redis
            const response = await client.get(res.data.userId);
            if(!response || response != res.data.room_id) {
                clientSocket.send(JSON.stringify({
                code : 6,
                message : "UnAuthorised"
                }));
                return;
            }
            socketMap.set(res.data.userId , clientSocket);
            userMap.set(clientSocket , res.data.userId);
            room_map.set(res.data.userId , res.data.room_id);
            if(!roomMemberCount.has(res.data.room_id)) roomMemberCount.set(res.data.room_id,1);
            else roomMemberCount.set(res.data.room_id,roomMemberCount.get(res.data.room_id)! + 1);
            //subscribe to the channel of this user id 
            if(!subscribedChannels.has(res.data.room_id)){
                // console.log("subscrbing" + res.data.userId + " "+ res.data.room_id);
                subscribedChannels.add(res.data.room_id)
                await subscribeHandler(res);
            }
            const list = await client.hGetAll(`${res.data.room_id}:clients`);
            //push the list to everyone
            if(flag) pushList(list);

        }
        else if(res.code == 2) {
            //user responds to question
            await responseSubmitHandler(res.data.userId,res.data.ques,res.data.ans,res.data.room_id);
        }
        else if(res.code == 3) {
            //user requesting to exit from room
            await exitHandler(res.data.userId);
            
        }

        }catch(err) {
            console.log(err);
        }
        
    }

    clientSocket.onclose = async ()=>{

        try {

            const userId = userMap.get(clientSocket);
        userMap.delete(clientSocket);
        socketMap.delete(userId!);
        //decrement the count
        const room_id = room_map.get(userId!);
        roomMemberCount.set(room_id! , roomMemberCount.get(room_id!)! - 1);
        if(roomMemberCount.get(room_id!) == 0) {
            subscriber.unsubscribe(room_id);
            subscribedChannels.delete(room_id!);
        }

        }catch(err) {
            console.log(err);
        }

    }
});

serverSocket.on('error',()=>{

    serverSocket.clients.forEach((cli)=>{
        if(cli.readyState === cli.OPEN) {
            cli.send(JSON.stringify({
                code:6,
                message : "Error occured in server"
            }))
        }
    })
    
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT,'0.0.0.0',()=>{
    console.log("listening on port " + PORT);
});