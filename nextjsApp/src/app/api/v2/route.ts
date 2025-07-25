import { NextRequest , NextResponse } from "next/server";
import { createClient } from "redis";
import { GoogleGenAI } from "@google/genai";

const redisPassword = process.env.PASSWORD;

export async function POST(req : NextRequest) {

let client;
const googleapi = process.env.GOOGLEAPI;

try {
client = createClient({
    username: 'default',
    password: redisPassword,
    socket: {
        host: 'redis-17753.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 17753
    }
});

await client.connect();

const {userId , code , topicDescription , room_id , questionsCount , username} = await req.json();

if(code == 1) {
    //craete a room
    const response = await client.get(`${userId}_${username}`);
    if(!response) {
        console.log(topicDescription)
        //gemini API call here for retrieving questions here 
        const prompt = `
            You are a quiz generator bot. Return exactly ${Math.max(5 , Math.min(30 , questionsCount))} MCQ questions based on the topic:
            "${topicDescription}"

            Rules:
            - If the topic description is not a valid or recognized subject (for example, if it is nonsense, empty, unrelated to academics, or not a real topic), return only this exact string: __INVALID_TOPIC__.
            - Do NOT attempt to generate questions for invalid, unclear, or unrecognized topics.

            If the topic is valid:
            - Options of each question should be very close and confusing to answer.
            - Each question must be in the following strict JSON format with four options each, and all questions must be enclosed in a single JSON array:
            [
            {
                "question": "string",
                "options": ["string", "string", "string", "string"],
                "answer": "string"
            },
            ...
            ]

            Instructions:
            - Only return the JSON array of questions, with no extra text, markdown, or formatting.
            - If the topic is invalid, return only: __INVALID_TOPIC__ (no quotes, no formatting).
            `;
        let questions_list;
        const ai = new GoogleGenAI({apiKey : googleapi});
        const api_res = await ai.models.generateContent({
            model : 'gemini-2.0-flash-lite',
            contents : prompt
        });

        if(api_res &&  api_res.text) {
            let rawList = api_res.text!.trim();
            if(rawList === "__INVALID_TOPIC__") throw new Error(rawList);
            if (rawList.startsWith('```')) {
                rawList = rawList.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim();
            }
            questions_list = JSON.parse(rawList);
        }
        else return NextResponse.json({
            code : 0,
            roomId : null,
            message : "Invalid Topic Description"

        } , {
            status : 422
        })

        //generate a random room id and store it in reddis
        const roomId = (Math.random() * 10000000).toFixed(0);
        await client.set(`${userId}_${username}`,roomId);
        //maintain a host table
        
        const data = {
            status : false,
            userId : `${userId}_${username}`,
            count : 1
        }

        await client.set(roomId,JSON.stringify(data));
        //maintain the list clients
        await client.hSet(`${roomId}:clients` , `${userId}_${username}` ,"Host");

        //leaderboard storage
        const leaderboardData = {
            value : `${userId}_${username}`,
            score : 0,
        }
        await client.zAdd(`${roomId}:leaderboardScore` , [leaderboardData])
        await client.zAdd(`${roomId}:finalLeaderboardScore` , [leaderboardData])
        await client.zAdd(`${roomId}:leaderboardTime` , [leaderboardData])
        await client.zAdd(`${roomId}:finalLeaderboardTime` , [leaderboardData])

        await client.set(`${roomId}:list`,JSON.stringify(questions_list))

        return NextResponse.json({
            code : 1,
            roomId : roomId,
            message : "Room Created"

        }, {
            status : 201
        });
    }
    else {
        return NextResponse.json({
        roomId : response,
        code : 0,
        message : "Already in an existing room exit it first"

        }, {
            status : 404
        })
    }
}

else if(code == 2) {
    //join room request
    //check if not already joined
    const response = await client.get(`${userId}_${username}`);
    if(response) { 
        return NextResponse.json({
        roomId : response,
        code : 0,
        message : "Already in an existing room exit it first"

        }, {
            status : 404
        })
    }
    //check if the room status is not true 
    else {
        const data_str = await client.get(`${room_id}`);
        if(data_str) {
            const data = JSON.parse(data_str);
            console.log(data);
            console.log(typeof data.count);
            if(data.status == false && data.count < 1000) {
                //join him in the room
                //update list of clients
                await client.hSet(`${room_id}:clients`,`${userId}_${username}`,"Participant");
                //room mapping
                await client.set(`${userId}_${username}`,room_id);
                //updating list of leaderboard
                const leaderboardData = {
                    score : 0 ,
                    value : `${userId}_${username}`
                }
                await client.zAdd(`${room_id}:leaderboardScore` , [leaderboardData])
                await client.zAdd(`${room_id}:finalLeaderboardScore` , [leaderboardData])
                await client.zAdd(`${room_id}:leaderboardTime` , [leaderboardData])
                await client.zAdd(`${room_id}:finalLeaderboardTime` , [leaderboardData])
                await client.set(room_id,JSON.stringify({
                    status : false,
                    userId : data.userId,
                    count : data.count + 1
                }));
                return NextResponse.json({
                    code : 1,
                    roomId : room_id,
                    message : "Room Joined"
                }, {
                    status : 201
                });
            }
            else if(data.status == false) {
                //maximum strength reached
                return NextResponse.json({
                    code : 3,
                    roomId : room_id,
                    message : "Room Strength maximised"
                }, {
                    status : 403
                });

            }
            else {
                //room started cannot join the room 
                 return NextResponse.json({
                    code : 3,
                    roomId : room_id,
                    message : "Room Started Cannot Join"
                }, {
                    status : 403
                });
            }
        }
         return NextResponse.json({
            code : 0,
            roomId : null,
            message : "Room doesnot exist"
        } , {
            status : 404
        });
        
    }
   
}

else if(code == 3) {
    //start quiz call
    const data = await client.get(`${room_id}:list`);
    const room_data = await client.get(`${room_id}`);
    const data_room = JSON.parse(room_data || "");
    console.log(data_room);
    console.log(`${userId}_${username}`)
    if(data && data_room.status == false && data_room.userId == `${userId}_${username}`) {
        await client.set(`${room_id}`,JSON.stringify({
            status : true,
            userId : `${userId}_${username}`,
            count : data_room.count
        }));
        await client.publish(room_id,data);
        return NextResponse.json({
            code : 1,
            roomId : room_id,
            message : "Room started"

        }, {
            status : 201
        })
    }
    else {
        return NextResponse.json({
            code : 0,
            roomId : room_id,
            message : "cannot start the room"
        },{
            status : 403
        })
    }
}

else if(code == 4) {
    //exit the room logic 
    //fethc the room the user is in curently 
        const response = await client.get(`${userId}_${username}`);
        if(response) {
            //delete the user entry 
            await client.del(`${userId}_${username}`);
            //remove from clinets , leaderboards ( time and score , final and normal)
            //delete the room if room becomes empty 
            await client.hDel(`${response}:clients`,`${userId}_${username}`);
            //remove from leaderboards
            await client.zRem(`${response}:leaderboardScore`, `${userId}_${username}`);
            await client.zRem(`${response}:finalLeaderboardScore`, `${userId}_${username}`);
            await client.zRem(`${response}:leaderboardTime`, `${userId}_${username}`);
            await client.zRem(`${response}:finalLeaderboardTime`, `${userId}_${username}`);
            //delete the room if host leaves the room 
            const room_detail = await client.get(`${response}`);
            const data = JSON.parse(room_detail!);
            if(data.userId == `${userId}_${username}`) {
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
            }
            return NextResponse.json({
                roomId : response,
                code : 1,
                message : "user Exited"
            },{
                status : 200
            });
        }
        return NextResponse.json({
            roomId : null,
            code : 0,
            message : "user is not in any room"
        },{
            status : 200
        });

    }

return NextResponse.json({
    code : 0,
    message : "Invalid code",
    roomId : null
}, {
    status : 400
})
}
catch(error) {
    return NextResponse.json({
      code: 10,
      message: error instanceof Error ? error.message : String(error),
      roomId: null
    }, {
        status : 500
    })
}
finally {
    if(client) await client.quit();
}
      
}

export async function GET(req : NextRequest) {

//check if for this userId room exits and if yes return the room id 
let client;

try {
client = createClient({
    username: 'default',
    password: redisPassword,
    socket: {
        host: 'redis-17753.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 17753
    }
});
await client.connect();
const { searchParams } = new URL(req.url);
const userId = searchParams.get("userId");
const response = await client.get(userId!);
if(response) return NextResponse.json({
    roomId : response,
    code : 1,
    message : "already in an existing room"
},{
    status : 200
})

return NextResponse.json({
    roomId : null,
    code : 0,
    message : "not in any room currently"
},{
    status : 200
})

}catch(error) {
    return NextResponse.json({
      code: 10,
      message: error instanceof Error ? error.message : String(error),
      roomId: null
    }, {
        status : 500
    })
}finally {
   if(client) await client.quit();
}

}