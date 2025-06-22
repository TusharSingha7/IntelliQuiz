import { NextRequest , NextResponse } from "next/server";
import { createClient } from "redis";
import { GoogleGenAI } from "@google/genai";
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

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
    const res = await req.formData();
    const file = res.get("file") as File;
    const text = res.get("text");
    const username = res.get('username');
    const userId = res.get('userId');

    if (!file || !(file instanceof File)) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arraybuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arraybuffer);
    let final_text = "";

    if (file.type === 'application/pdf') {
        const data = await pdfParse(buffer) as { text: string };
        final_text = data.text;              // all extracted PDF text
    }
    else if (
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
    ) {
        const { value } = await mammoth.extractRawText({ buffer });
        final_text = value;                  // all extracted DOCX text
    }
    else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }

    const prompt = `
You are an expert AI Quiz Generator. Your primary function is to create high-quality Multiple Choice Questions (MCQs) based on a provided text, adhering to a strict set of rules and a specific JSON output format.

1. Core Task

- Analyze the ${final_text}.
- Based on the analysis, either generate a JSON array of MCQs or return an invalid topic flag.

2. Inputs

- ${final_text}: The text content used to generate the quiz questions.
- ${text}: Optional user-defined rules to modify the quiz generation (e.g., "focus on dates," "create 5 questions instead of 3").

3. Validation Logic

First, you must validate the ${final_text}.

- Valid Text:** The text must be coherent, factual, and sufficiently detailed to generate meaningful questions. It can be an academic theory, a historical account, a scientific explanation, etc.
- Invalid Text:** If the text is nonsensical, empty, extremely short, purely opinion-based without facts, or otherwise unsuitable for creating an academic quiz, it is considered invalid.

4. Rules for Quiz Generation (for Valid Text Only)

- Relevance: All questions, options, and answers must be derived directly from the information present in the ${final_text}. you can use outside knowledge.
- Challenging Options: The incorrect options (distractors) for each question should be plausible and closely related to the question's topic to be confusing and challenging.
- Answer Accuracy: The value of the "answer" key must be an exact, case-sensitive match to one of the strings in the "options" array.
- Follow Instructions: Adhere to any ${text}, unless they conflict with the fundamental rules, especially the required JSON output format.

5. Strict Output Format

Your response must be ONLY ONE of the following two formats, with no extra text or explanations.

A. For a Valid Topic:

Return a single, raw JSON array containing question objects.
JSON Structure:
json
[
  {
    "question": "The full text of the question.",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "answer": "The correct option's exact text from the options array."
  },
  {
    "question": "The second question.",
    "options": [
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4"
    ],
    "answer": "The correct answer for the second question."
  }
]

B. For an Invalid Topic:

Return only the following exact string, with no quotes, formatting, or any other characters.

__INVALID_TOPIC__`;

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
    else {
        return new NextResponse(JSON.stringify({
            code : 0,
            roomId : null,
            message : "Invalid data inside file"

        }) , {
            status : 500
        })
    }
    //set the question list now and create the room
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

        return new NextResponse(JSON.stringify({
            code : 1,
            roomId : roomId,
            message : "Room Created"

        }), {
            status : 200
        });
}
catch(error) {
    return new NextResponse(JSON.stringify({
      code: 10,
      errorMessage: error instanceof Error ? error.message : String(error),
      roomId: null
    }), {
      status: 500
    });
}
finally {
    if(client) await client.quit();
}
      
}

export async function GET() {
    return NextResponse.json({
        msg : "hi from server"
    })
}