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

bot.start( async (ctx) => {

    await prisma.user.upsert({
        where: {
            chatId: ctx.update.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.update.message.chat.id,
            name: ctx.update.message.from.first_name,
            lastname: ctx.update.message.from.last_name,
        }
    });

    ctx.reply(`Hola ${ctx.from.first_name} ${ctx.from.last_name}, soy un bot asistente de telegram para consultar el clima y la cantidad de mensajes, en que puedo ayudarte?`, Markup.keyboard(['¡Quiero saber el clima! 🌞', '¡Quiero contar! 📊']).resize().persistent())
});

bot.help( async (ctx) => {

    await prisma.user.upsert({
        where: {
            chatId: ctx.update.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.update.message.chat.id,
            name: ctx.update.message.from.first_name,
            lastname: ctx.update.message.from.last_name,
        }
    });

    ctx.reply('Hola! Me llamo Lucia, soy un bot asistente para ayudarte a consultar por el clima de una ciudad o para reponderte por cuantos mensajes has mandado.\nPuedes preguntarme ello en el menu inferior, o puedes preguntarme directamente por el chat.\n\n puedes seleccionar una ciudad por defecto y cosultarme por el menu, o mandarme un mensaje con el nombre de la ciudad si es que deseas saber el clima de otras ciudades.')
});

bot.hears('¡Quiero saber el clima! 🌞', async (ctx) => {

    console.log(ctx, null, 2);
    const chatId = ctx.message.chat.id;

    await prisma.user.upsert({
        where: {
            chatId: ctx.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.message.chat.id,
            name: ctx.message.from.first_name,
            lastname: ctx.message.from.last_name,
        }
    });

    const user = await prisma.user.findUnique({
        where: {
            chatId: chatId
        },
        select: {
            city: true,
            country: true
        }
    });

    console.log(`user: ${JSON.stringify(user)}`, null, 2);

    if (!user.city && !user.country) {
        ctx.reply('Para poder enviarte el pronostico de tu ciudad, tienes que primero indicarme cual es tu ciudad y pais');
    } else {
        const text = `Quiero saber el clima de ${user.city}, ${user.country}`;
        const response = await callFunctions(text, chatId);
        await ctx.telegram.sendMessage(chatId, response);
    }

});

bot.hears('¡Quiero contar! 📊', async (ctx) => {

    const chatId = ctx.message.chat.id;

    await prisma.user.upsert({
        where: {
            chatId: ctx.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.message.chat.id,
            name: ctx.message.from.first_name,
            lastname: ctx.message.from.last_name,
        }
    });

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


    await prisma.user.upsert({
        where: {
            chatId: ctx.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.message.chat.id,
            name: ctx.message.from.first_name,
            lastname: ctx.message.from.last_name,
        }
    });

    // enviar el texto a openai para procesarlo
    const response = await callFunctions(text, chatId);

    await ctx.telegram.sendMessage(chatId, response);
});




bot.on(message('voice'), async (ctx) => {

    const file_id = ctx.update.message.voice.file_id;
    const chatId = ctx.update.message.from.id;

    const transcription = await getAudioFromTelegram(file_id);


    await prisma.user.upsert({
        where: {
            chatId: ctx.update.message.chat.id
        },
        update: {
            messageCounter: {
                increment: 1
            }
        },
        create: {
            chatId: ctx.update.message.chat.id,
            name: ctx.update.message.chat.first_name,
            lastname: ctx.update.message.chat.last_name,
        }
    });

    // enviar el texto a openai para procesarlo
    const response = await callFunctions(transcription, chatId);

    await ctx.telegram.sendMessage(chatId, response);


});


bot.launch();