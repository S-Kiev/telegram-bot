import { countries }  from './countries/countries.js';

export const functionDictionary = [
    {
        "name": "getCurrentWeather",
        "description": "El usuario te pedira el clima de una ciudad",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "Es el nombre de la ciudad"
            },
            "code": {
              "type": "string",
              "description": `es el codigo de pais de la ciudad, este debe estar en el estadar ISO 3166-1 alpha-2, guiate por esta lista de paises:\n ${countries}\n\n Si el usuario te proporciona un pais retona el codigo de ese pais.`
            }
          },
          "required": ["city", "code"]
        }
      },
      {
        "name": "getTotalMessages",
        "description": "El usuario te pedira cuantos mensajes ha mandado",
        "parameters": {
          "type": "object",
          "properties": {
          },
          "required": []
        }
      },
      {
        "name": "setLocation",
        "description": "El usuario te indicara cual es su ciudad y pais (el pais debe estar en al codigo del estadar ISO 3166-1 alpha-2)",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {
              "type": "string",
              "description": "Es el nombre de la ciudad"
            },
            "code": {
              "type": "string",
              "description": `es el codigo de pais de la ciudad, este debe estar en el estadar ISO 3166-1 alpha-2, guiate por esta lista de paises:\n ${countries}\n\n Si el usuario te proporciona un pais retona el codigo de ese pais.`
            }
          },
          "required": ["city", "code"]
        }
      }
]