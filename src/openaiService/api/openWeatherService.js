import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();


export async function getWeather(city, code) {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `http://api.openweathermap.org/geo/1.0/direct?q=${city},${code}&limit=5&appid=${process.env.OPEN_WEATHER_API_KEY}`,
            headers: { }
        };

        const response = await axios(config);

        if(!response) {
            return { error: 'Lo siento no pudo encontrar el clima de esa ciudad, quizas la ciudad no existe o no esta en el pais que especificaste, intentalo de nuevo' };
        }

        const lat = response.data[0].lat;
        const lon = response.data[0].lon;

        let config2 = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${process.env.OPEN_WEATHER_API_KEY}`,
            headers: { }
        };

        const response2 = await axios(config2);

        if(!response2) {
            return { error: 'Lo siento pero ocurrio un error al obtener el clima, intentalo de nuevo' };
        }   

        return response2.data;
          
    } catch (error) {
        return { error: 'Lo siento pero ocurrio un error al obtener el clima, intentalo de nuevo' };
    }
}