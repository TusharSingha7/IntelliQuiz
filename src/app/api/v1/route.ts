import { WebSocketServer, WebSocket } from 'ws';
import { communication } from '../../lib';
import {createClient} from 'redis'

const serverSocket = new WebSocketServer({port : 8080});

const subscriber = createClient();
const client = createClient();
const socketMap = new Map<string,WebSocket>();

serverSocket.on('connection',async (clientSocket : WebSocket)=>{
    
    await client.connect();
    await subscriber.connect();
    //connection established
    console.log("client connected : " + clientSocket);

    clientSocket.onmessage = async (message)=>{
        const res : communication = JSON.parse(
            typeof message.data === 'string'
                ? message.data
                : message.data.toString()
        );

        if(res.code == 1) {
            socketMap.set(res.data.userId , clientSocket)
            //subscribe to the channel of this user id 
            subscriber.subscribe(res.data.room_id,async (message , channelName)=>{
                //push the message to the socket of the userId
                //get the socket from the map and push to the user
                //it can be leaderboard or question
                //get the list of users from clinet connected to the room
                const list = await client.hGetAll(`${channelName}:clients`);

                const data = JSON.parse(message);

                if(data.code == 1) {
                    //its a list of questions 
                    //push in intervals of 5sec to the users 
                    for(const ques in data.message) {
                        for(const id in list) {
                            const socket = socketMap.get(id);
                            if(socket && socket.OPEN) {
                                socket.send(JSON.stringify({
                                    code : 1,
                                    data : ques
                                }));
                                client.hSet(`${id}:quesTime`,ques,JSON.stringify(new Date()));
                            }
                        }
                        //wait 5 sec
                        await new Promise((res)=>{
                            setTimeout(res,5000);
                        })
                    }
                }
                else if(data.code == 2) {
                    //its the leaderboard data
                    //push to all the users without any delay manually 
                    for(const id in list) {
                        const socket = socketMap.get(id);
                        if(socket && socket.OPEN) {
                            socket.send(JSON.stringify({
                                code : 2,
                                data : data.message
                            }))
                        }
                    }
                }

            })

        }

        else if(res.code == 2) {
            //reponse submitted towards a question calculate the time take to submit if questino 
            //entry exits 
            //get the question from res and time taken to respond
            const data = await client.hGet(`${res.data.userId}`,res.data.ques);
            if(data){
                const timeSent = JSON.parse(data || "");
                const time = new Date(timeSent);
                const timeDiff = Math.abs(time.getTime() - (new Date()).getTime());
                const timeInSeconds = (timeDiff / 1000);
                //update the leaderboard score accordingly 
                await client.zAdd(`${res.data.room_id}:leaderboardTime`,{
                    value : res.data.userId,
                    score : timeInSeconds
                });
                const prevData = await client.zScore(`${res.data.room_id}:finalLeaderboardTime`,res.data.userId);
                if(prevData)
                {
                    await client.zAdd(`${res.data.room_id}:finalLeaderboardTime`,{
                        value : res.data.userId,
                        score : prevData + timeInSeconds
                    });
                }
                
            }

        }
        
    }

})