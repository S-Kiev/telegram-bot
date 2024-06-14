import { OpenAI } from 'openai';
import { functionDictionary } from './functionDictionary.js';
import { getWeather } from './openWeatherService.js';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({});

export async function callFunctions(text) {
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
                console.log(objectArguments);
                Obj = await getWeather(objectArguments.city, objectArguments.code);
            case 'getTotalMessages':
                //llamar a prisma
                //Obj = await prima(idChat);
            default:
                break;
        }

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