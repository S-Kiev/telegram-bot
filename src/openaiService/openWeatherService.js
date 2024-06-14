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

        if(!response){
            throw new Error('Error al obtener la informacion de la ciudad');
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

        if(!response2){
            throw new Error('Error al obtener la informacion del clima');
        }   

        return response2.data;
          
    } catch (error) {
        throw new Error(error);
    }
}