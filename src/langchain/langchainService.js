import dotenv from 'dotenv';
dotenv.config();

import { BufferMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { UpstashRedisChatMessageHistory } from '@langchain/community/stores/message/upstash_redis';

import { callFunctions } from '../openaiService/openaiService.js';

export async function callChatMemory(text, chatId) {

    //evaluar si hay que llamar a una funcion

    const memory = new BufferMemory({
        chatHistory: new UpstashRedisChatMessageHistory({
            sessionId: chatId,
            sessionTTL: 300,
            config: {
                url: process.env.UPSTASH_REDIS_URL,
                token: process.env.UPSTASH_REDIS_TOKEN
            }
        }),
    });

    const openai = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo-0613',
        temperature: 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
        
    });

    const conversationChain = new ConversationChain({
        memory,
        llm: openai,
    });

    try {
        const openaiResponse = await callFunctions(text, chatId);
    } catch (error) {
        console.log(error);
    }

    text = `Resultado de la consulta a la api de openWhaether: ${openaiResponse} \n\nEsta es la consulta original del usuario: ${text}`;

    const response = await conversationChain.call({
        input: text,
    });

    console.log(response);

    return response.response;
}

callChatMemory();

