import { OpenAI } from 'openai';
import { functionDictionary } from './functionDictionary.js';
import { getWeather } from './openWeatherService.js';
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const openai = new OpenAI({});

export async function callFunctions(text, chatId) {
    let response = null;

    try {
        response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-0613',
            messages: [
                { role: 'system', content: 'Tu nombre es Lucia y eres un asistente de telegram que brinda al usuario el clima y la cantidad de mensajes del chat' },
                { role: 'user', content: text }
            ],
            functions: functionDictionary,
            temperature: 0.7
        });

        if (response.choices[0].finish_reason === "stop") {
            return response.choices[0].message.content;
        }

        const { name: nameFunction, arguments: argumentsFunction } = response.choices[0].message.function_call;
        let objectArguments = JSON.parse(argumentsFunction);
        let Obj;

        switch (nameFunction) {
            case 'getCurrentWeather':
                objectArguments.code = objectArguments.code ?? 'UY';
                console.log((objectArguments));
                Obj = await getWeather(objectArguments.city, objectArguments.code);

                if (Obj === null) {
                    Obj = { error: 'Lo siento no pudo encontrar el clima de esa ciudad' };
                }

                break;
            case 'getTotalMessages':

                const messages = await prisma.user.findUnique({
                    where: {
                        chatId: BigInt(chatId)
                    },
                    select: {
                        messageCounter: true
                    }
                });

                if(messages){
                    Obj = { messages: `Tienes ${messages.messageCounter} mensajes` };
                }else{
                    Obj = { messages: `Parece que no tienes mensajes` };
                }

                break;

            case 'setLocation':

                const city = objectArguments.city;
                const country = objectArguments.code;

                if(!city || !country){
                    Obj = { error: 'No se pudo encontrar la ciudad o el país' };
                    break;
                }

                Obj = await prisma.user.update({
                    where: {
                        chatId: BigInt(chatId)
                    },
                    data: {
                        city: city,
                        country: country
                    },
                    select: {
                        city: true,
                        country: true,
                        name: true,
                        lastname: true
                    }
                });

                break;
            default:
                break;
        }

        console.log(`nameFunction: ${nameFunction}`);
        console.log(`argumentsFunction: ${argumentsFunction}`);
        console.log(`text: ${text}`);


        const ultimateResponse = await secondCallOpenAI(text, argumentsFunction, nameFunction, Obj);

        return ultimateResponse;

    } catch (error) {
        console.log(error);   
        throw new Error('Error al llamar a la API de OpenAI');
    }
}

async function secondCallOpenAI(text, argumentsFunction, nameFunction, Obj) {
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0613',
        "messages": [
            {
                "role": "system",
                "content": 'Tu nombre es Lucia y eres un asistente de telegram que brinda al usuario el clima y la cantidad de mensajes del chat'
            },
            {
                "role": "user", 
                "content": text
            },
            {
                "role": "assistant",
                "content": null,
                "function_call": {
                    "name": nameFunction,
                    "arguments": argumentsFunction
                }
            },
            {
              "role": "function",
              "name" : nameFunction,
              "content": JSON.stringify(Obj),
            }
          ],
          "functions": functionDictionary
    });

    if(response.choices[0].finish_reason === "stop") {
        console.log(response.choices[0].message.content)
        return response.choices[0].message.content;
    } else {
      return `Ups parace que algo ha salido mal al llamar a la funcion: ${nameFunction}`;
    }
}