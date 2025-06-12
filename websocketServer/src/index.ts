import { WebSocketServer, WebSocket } from 'ws';
import {createClient} from 'redis'

interface communication {
    code : number,
    data : any
}

const serverSocket = new WebSocketServer({port : 8080});

const subscriber = createClient();
const client = createClient();
const socketMap = new Map<string,WebSocket>();
const userMap = new Map<WebSocket,string>();
const subscribedChannels = new Set<string>();
const roomMemberCount = new Map<string,number>();
const room_map = new Map<string,string>();

let flag = true;

async function main() {
    if (!client.isOpen) await client.connect();
    if (!subscriber.isOpen) await subscriber.connect();
}
main()

async function subscribeHandler(res : communication) {
    //push the message to the socket of the userId
    //get the socket from the map and push to the user
    //it can be leaderboard or question
    //get the list of users from clinet connected to the room
    subscriber.subscribe(res.data.room_id,async (message,channel)=>{

    const list = await client.hGetAll(`${channel}:clients`);
    const data = JSON.parse(message);

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
                    console.log(id);
                    console.log(JSON.stringify(org));
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
            })
        }
        //push the final leaderboard
        const fleaderboardTime = await client.zRangeWithScores(`${res.data.room_id}:finalLeaderboardTime`,0,-1,{REV:true});
        const fleaderboardScore = await client.zRangeWithScores(`${res.data.room_id}:finalLeaderboardScore`,0,-1,{REV:true});
        let hostId : string;
        for(const id in list) {
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

    });
        
}

async function exitHandler(userId : string) {

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
                await client.del(id);
            }
        } 

    }
}

async function responseSubmitHandler(userId:string , ques : {
    question : string,
    options : string[],
    answer : string
} , ans : string , room_id : string) {
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
}


serverSocket.on('connection',async (clientSocket : WebSocket)=>{

    //connection established
    // console.log("client connected : " + clientSocket);

    clientSocket.onmessage = async (message)=>{
        const res : communication = JSON.parse(
            typeof message.data === 'string'
                ? message.data
                : message.data.toString()
        );

        if(res.code == 1) {
            //check connection authenticity
            //userId , roomId , verify this data from redis 
            const response = await client.get(res.data.userId);
            if(!response || response != res.data.room_id) {
                clientSocket.send(JSON.stringify({
                    code : 5,
                    data : "unauthorized user in room or room doesnot exist"
                }));
                clientSocket.close();
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
            if(flag) {
                for(const id in list) {
                    const socket = socketMap.get(id);
                    if(socket && socket.OPEN) {
                        socket.send(JSON.stringify({
                            code : 4,
                            data : list
                        }))
                    }
                }
            }

        }
        else if(res.code == 2) {
            //user responds to question
            responseSubmitHandler(res.data.userId,res.data.ques,res.data.ans,res.data.room_id);
        }
        else if(res.code == 3) {
            //user requesting to exit from room
            exitHandler(res.data.userId)
        }
        
    }

    clientSocket.onclose = async ()=>{

        //remove the mappings and decrement the count 
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

    }
})
