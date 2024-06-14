import { Telegraf, session } from "telegraf";
import { message } from "telegraf/filters";
import { getAudioFromTelegram } from './audioProcess/getAudioFromTelegram.js';
import { callFunctions } from './openaiService/openaiService.js';

import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

bot.use(session());

bot.start((ctx) => ctx.reply(`Hola ${ctx.from.first_name} ${ctx.from.last_name}, soy un bot asistente de telegram para consultar el clima y la cantidad de mensajes, en que puedo ayudarte?`));
bot.help((ctx) => ctx.reply('Hola! soy un bot asistente para ayudarte a consultar por el clima de una ciudad o para reponderte por cuantos mensajes has mandado.\nPuedes preguntarme ello en el menu inferior, o puedes preguntarme directamente por el chat.\n\n puedes seleccionar una ciudad por defecto y cosultarme por el menu, o mandarme un mensaje con el nombre de la ciudad si es que deseas saber el clima de otras ciudades.'));

bot.on(message('text'), async (ctx) => {
    console.log(ctx.message);
    const text = ctx.message.text;
    console.log(text);

    // enviar el texto a openai para procesarlo
    const response = await callFunctions(text);

    await ctx.telegram.sendMessage(ctx.message.chat.id, response);
});




bot.on(message('voice'), async (ctx) => {
    console.log("voice");

    console.log(ctx.update.message.voice.file_id);
    const file_id = ctx.update.message.voice.file_id;
    console.log(ctx.update.message.chat.id);

    const transcription = await getAudioFromTelegram(file_id);

    // enviar el texto a openai para procesarlo
    const response = await callFunctions(transcription);

    await ctx.telegram.sendMessage(ctx.message.chat.id, response);


});
bot.launch();