import { IncomingMessage } from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import { communication } from '../../lib';
import {createClient} from 'redis'

const serverSocket = new WebSocketServer({port : 8080});

const client = createClient();

serverSocket.on('connection',async (clientSocket : WebSocket)=>{
    
    await client.connect();
    //connection established
    console.log("client connected : " + clientSocket);

    clientSocket.onmessage = (message)=>{
        const res : communication = JSON.parse(
            typeof message.data === 'string'
                ? message.data
                : message.data.toString()
        );
        
    }

})