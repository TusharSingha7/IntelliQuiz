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

    // console.log(data);

        for(const ques in data) {
            const org = data[ques];
            console.log(org);
            for(const id in list) {
                const socket = socketMap.get(id);
                if(socket && socket.OPEN) {
                    socket.send(JSON.stringify({
                        code : 1,
                        data : org
                    }));
                    client.hSet(`${id}:quesTime`,ques,JSON.stringify(new Date()));
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

    });
                    
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

        // console.log(res);

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
        else if(res.code == 2) {
            //reponse submitted towards a question calculate the time take to submit if questino 
            //entry exits 
            //get the question from res and time taken to respond
            const data = await client.hGet(`${res.data.userId}`,res.data.ques);
            await client.del(`${res.data.userId}`)
            if(data){
                const timeSent = JSON.parse(data || "");
                const time = new Date(timeSent);
                const timeDiff = Math.abs(time.getTime() - (new Date()).getTime());
                const timeInSeconds = (timeDiff / 1000);
                const lostScore = 200*timeInSeconds;
                let newScore = Math.max(0,1000 - lostScore);
                //match the answer
                if(res.data.ans != res.data.ques.answer) newScore = 0;
                //update the leaderboard score accordingly
                await client.zAdd(`${res.data.room_id}:leaderboardTime`,{
                    value : res.data.userId,
                    score : timeInSeconds
                });
                await client.zAdd(`${res.data.room_id}:leaderboardScore`,{
                    value : res.data.userId,
                    score : newScore
                })
                await client.zIncrBy(`${res.data.room_id}:finalLeaderboardScore`,newScore,`${res.data.userId}`)
                await client.zIncrBy(`${res.data.room_id}:finalLeaderboardTime`,timeInSeconds,`${res.data.userId}`)
            }

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