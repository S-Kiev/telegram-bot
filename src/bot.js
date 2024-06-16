import { Telegraf, session, Markup } from "telegraf";
import { message } from "telegraf/filters";
import { getAudioFromTelegram } from './audioProcess/getAudioFromTelegram.js';
import { callFunctions } from './openaiService/openaiService.js';
import { PrismaClient } from '@prisma/client';

import dotenv from "dotenv";
dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

const prisma = new PrismaClient();

bot.use(session());

bot.telegram.setMyCommands([
    { command: '/start', description: 'Iniciar el bot' },
    { command: '/help', description: 'Obtener ayuda' },
]);

async function countMessages(chatId, name, lastname) {
    await prisma.user.upsert({
        where: {
            chatId: chatId
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: chatId,
            name: name,
            lastname: lastname,
        }
    });
}

bot.start( async (ctx) => {

    await countMessages(ctx.update.message.chat.id, ctx.update.message.from.first_name, ctx.update.message.from.last_name);

    ctx.reply(`Hola ${ctx.from.first_name} ${ctx.from.last_name}, soy Patricia, un bot asistente de telegram para consultar el clima y la cantidad de mensajes que ma has mandado.\n\nPuedes preguntarme por los botones del menu inferior, o puedes mandarme mensajes de texto y audio\n\n ademas no dudes en usar el comando /help si necesitas ayuda`, Markup.keyboard(['¡Quiero saber el clima de mi ciudad! 🌞', '¡Quiero contar mis mensajes! 📊']).resize().persistent())
});

bot.help( async (ctx) => {

    await countMessages(ctx.update.message.chat.id, ctx.update.message.from.first_name, ctx.update.message.from.last_name);

    ctx.reply('Hola! Me llamo Patricia, soy un bot asistente para ayudarte a consultar por el clima de una ciudad o para reponderte por cuantos mensajes has mandado.\n Puedes usar el comando /start para ver un menu donde podras ver el clima de tu ciudad (primero debes decirme de donde eres), o puedes preguntarme por cuantos mensajes me has enviado, los tengo contados!!.\n\n Si deseas saber el clima de una ciudad en particular puedes mandarme un mensaje de texto o audio consultandome sobre el clima de esa ciudad, acopañado del pais al que pertenece \n\n Tambien puedes modificar tu ciudad por defecto de la misma manera, me dices de que ciudad y pais eres y lo recordare!')
});

bot.hears('¡Quiero saber el clima de mi ciudad! 🌞', async (ctx) => {

    console.log(ctx, null, 2);
    const chatId = ctx.message.chat.id;

    await countMessages(chatId, ctx.message.from.first_name, ctx.message.from.last_name);

    const user = await prisma.user.findUnique({
        where: {
            chatId: chatId
        },
        select: {
            city: true,
            country: true
        }
    });

    if (!user.city && !user.country) {
        ctx.reply('Para poder enviarte el pronostico climatico de tu ciudad primero tienes que decirme de donde eres y de que pais');
    } else {
        const text = `Quiero saber el clima de ${user.city}, ${user.country}`;
        const response = await callFunctions(text, chatId);
        await ctx.telegram.sendMessage(chatId, response);
    }

});

bot.hears('¡Quiero contar mis mensajes! 📊', async (ctx) => {

    const chatId = ctx.message.chat.id;

    await countMessages(chatId, ctx.message.from.first_name, ctx.message.from.last_name);

    const messages = await prisma.user.findUnique({
        where: {
            chatId: chatId
        },
        select: {
            messageCounter: true
        }
    });

    ctx.reply(`Has enviado ${messages.messageCounter} mensajes.`);
});

bot.on(message('text'), async (ctx) => {
    console.log(ctx.message);
    const text = ctx.message.text;
    const chatId = ctx.message.chat.id;
    console.log(text);

    await countMessages(chatId, ctx.message.from.first_name, ctx.message.from.last_name);

    const response = await callFunctions(text, chatId);

    await ctx.telegram.sendMessage(chatId, response);
});


bot.on(message('voice'), async (ctx) => {

    const file_id = ctx.update.message.voice.file_id;
    const chatId = ctx.update.message.from.id;

    const transcription = await getAudioFromTelegram(file_id);

    await countMessages(chatId, ctx.update.message.chat.first_name, ctx.update.message.chat.last_name);

    const response = await callFunctions(transcription, chatId);

    await ctx.telegram.sendMessage(chatId, response);
});


bot.launch();