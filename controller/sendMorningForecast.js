const util = require("util");
const db = require("../config/dbConfig");
const axios = require("axios");
db.query = util.promisify(db.query);
const sendMorningForecast = async function (data) {
  try {
    let query = `SELECT name,location from user WHERE id = ${data.id}`;
    let result = await db.query(query);

    if (result.length > 0) {
      let location = result[0].location;
      location = location.charAt(0).toUpperCase() + location.slice(1);
      let name = result[0].name;
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.API_KEY}`;
      const response = await axios.get(url);
      let temp = (response.data.main.temp - 273.15).toFixed(2);

      if (response.data.cod === 200) {
        const responseString = `\`\`\`
        --------------------------------------------------------
        | Hi @${name} Good Morning! 
        | Your today's weather update for ${location}:  
        --------------------------------------------------------
        | Description: ${response.data.weather[0].description}  
        | Temperature: ${temp} °C      
        | Wind Speed: ${response.data.wind.speed} m/s     
        | Humidity: ${response.data.main.humidity}%          
        --------------------------------------------------------
        \`\`\``;

        return responseString;
      } else {
        return `Hi ${name}! Sorry I am unable to get any weather updates now`;
      }
    }
  } catch (err) {
    console.log("Error occured!", err);
    return err;
  }
};

module.exports = { sendMorningForecast };
