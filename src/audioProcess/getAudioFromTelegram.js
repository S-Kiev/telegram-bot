import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

export async function getAudioFromTelegram(file_id) {
    try {
        const getPath = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_KEY}/getFile?file_id=${file_id}`;
        const response = await axios.get(getPath);
        if (!response.data.ok) {
            throw new Error('Error al obtener el file_path de Telegram');
        }

        const path = response.data.result.file_path;

        const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_KEY}/${path}`;

        const audioResponse = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'arraybuffer'
          });

          const data = new FormData();
          data.append('file', Buffer.from(audioResponse.data), {
            filename: 'audio.ogg',
            contentType: 'audio/ogg'
          });
          data.append('model', 'whisper-1');

          const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.openai.com/v1/audio/transcriptions',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              ...data.getHeaders()
            },
            data: data
          };
      
          const whisperResponse = await axios.request(config);
      
          return whisperResponse.data.text;

    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}


