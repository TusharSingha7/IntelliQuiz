import { NextRequest , NextResponse } from "next/server";
import { createClient } from "redis";

export async function POST(req : NextRequest) {

let client;

try {
client = createClient();
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});
await client.connect();

const {userId , code , topicName , room_id} = await req.json();

if(code == 1) {
    //craete a room
    const response = await client.get(userId);
    if(!response) {
        //gemini API call here for retrieving questions here 
        const questions_list = {
            list : [{topicName} , {topicName}]
        }

        if(!questions_list) return new NextResponse(JSON.stringify({
            code : 0,
            roomId : null,
            message : "Invalid Topic Description"

        }) , {
            status : 500
        })
        //generate a random room id and store it in reddis
        const roomId = (Math.random() * 10000000).toString();
        await client.set(userId,roomId);
        //maintain a host table
        
        const data = {
            status : false,
            userId : userId
        }

        await client.set(roomId,JSON.stringify(data));
        //maintain the list clients
        await client.hSet(`${roomId}:clients` , userId ,"Host");

        //leaderboard storage
        const leaderboardData = {
            value : userId,
            score : 0,
        }
        await client.zAdd(`${roomId}:leaderboardScore` , [leaderboardData])
        await client.zAdd(`${roomId}:finalLeaderboardScore` , [leaderboardData])
        await client.zAdd(`${roomId}:leaderboardTime` , [leaderboardData])
        await client.zAdd(`${roomId}:finalLeaderboardTime` , [leaderboardData])

        await client.set(`${roomId}:list`,JSON.stringify(questions_list))

        return new NextResponse(JSON.stringify({
            code : 1,
            roomId : roomId,
            message : "Room Created"

        }), {
            status : 200
        });
    }
    else {
        return new NextResponse(JSON.stringify({
            code : 0,
            roomId : response,
            message : "Already in an existing room exit it first"
        }), {
            status : 500
        })
    }
}

else if(code == 2) {
    //join room request
    //check if not already joined
    const response = await client.get(userId);
    if(response) { 
        return new NextResponse(JSON.stringify({
        roomId : response,
        code : 0,
        message : "Already in an existing room exit it first"

        }), {
            status : 500
        })
    }
    //check if the room status is not true 
    else {
        const data_str = await client.get(`${room_id}`);
        if(data_str) {
            const data = JSON.parse(data_str);
            if(data.status == false) {
                //join him in the room
                //update list of clients
                await client.hSet(`${room_id}:clients`,userId,"Participant");
                //room mapping
                await client.set(userId,room_id);
                //updating list of leaderboard
                const leaderboardData = {
                    score : 0 ,
                    value : userId
                }
                await client.zAdd(`${room_id}:leaderboardScore` , [leaderboardData])
                await client.zAdd(`${room_id}:finalLeaderboardScore` , [leaderboardData])
                await client.zAdd(`${room_id}:leaderboardTime` , [leaderboardData])
                await client.zAdd(`${room_id}:finalLeaderboardTime` , [leaderboardData])
                return new NextResponse(JSON.stringify({
                    code : 1,
                    room_id : room_id,
                    message : "Room Joined"
                }) , {
                    status : 200
                });
            }
            else {
                //room started cannot join the room 
                 return new NextResponse(JSON.stringify({
                    code : 3,
                    room_id : room_id,
                    message : "Room Started Cannot Join"
                }), {
                    status : 500
                });
            }
        }
         return new NextResponse(JSON.stringify({
            code : 0,
            room_id : null,
            message : "Room doesnot exist"
        }) , {
            status : 500
        });
        
    }
   
}

else if(code == 3) {
    //start quiz call
    const data = await client.get(`${room_id}:list`);
    const room_data = await client.get(`${room_id}`);
    const data_room = JSON.parse(room_data!);
    if(data && data_room.status == false && data_room.userId == userId) {
        await client.set(`${room_id}`,JSON.stringify({
            status : true,
            userId : userId
        }));
        await client.publish(room_id,data);
        return new NextResponse(JSON.stringify({
            code : 1,
            room_id : room_id,
            message : "Room started"

        }), {
            status : 200
        })
    }
    return new NextResponse(JSON.stringify({
            code : 1,
            room_id : room_id,
            message : "cannot start the room"
    }),{
        status : 500
    })
}

return new NextResponse(JSON.stringify({
    code : 0,
    message : "Invalid code",
    room_id : null
}),{
    status : 500
})
}
catch(error) {
    console.log(error);
    return new NextResponse(JSON.stringify({
      code: 10,
      message: error instanceof Error ? error.message : String(error),
      room_id: null
    }), {
      status: 500
    });
}
finally {
    if(client) await client.quit();
}
      
}

export async function GET(req : NextRequest) {

//check if for this userId room exits and if yes return the room id 
let client;

try {
client = createClient();
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});
await client.connect();
const { searchParams } = new URL(req.url);
const userId = searchParams.get("userId");
const response = await client.get(userId!);
if(response) return new NextResponse(JSON.stringify({
    roomId : response,
    code : 1,
    message : "already in an existing room"
}) , {
    status : 200
});

return new NextResponse(JSON.stringify({
    roomId : null,
    code : 0,
    message : "not in any room currently"
}) , {
    status : 200
})

}catch(error) {
   console.log(error);
    return new NextResponse(JSON.stringify({
      code: 10,
      message: error instanceof Error ? error.message : String(error),
      room_id: null
    }), {
      status: 500
    });
}finally {
   if(client) await client.quit();
}

}