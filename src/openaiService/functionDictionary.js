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
              "description": "es el codigo de pais de la ciudad, este debe estar en el estadar ISO 3166-1 alpha-2, ejemplos: Montevideo 'UY', Buenos Aires 'AR', Nueva York 'US'. Si el usuario te proporciona un pais retona el codigo de ese pais. Sino te lo proporciona y no sabes que a que pais pertenece la ciudad entonces usa 'UY'"
            }
          },
          "required": ["city"]
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
      }
]