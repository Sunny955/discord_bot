const axios = require("axios");
const getList = require("../utils/getList");
async function getWeather(location, day) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&cnt=7&appid=${process.env.API_KEY}`;
  let d = day.toLowerCase();
  try {
    const response = await axios.get(url);
    const data = response.data;

    const weather = data.list[getList(d)].weather[0].description;
    const temperature = data.list[getList(d)].main.temp;
    const feelsLike = data.list[getList(d)].main.feels_like;
    const humidity = data.list[getList(d)].main.humidity;
    const temperatureCelsius = (temperature - 273.15).toFixed(2);
    const feelsLikeCelsius = (feelsLike - 273.15).toFixed(2);
    const parsedDay = d.charAt(0).toUpperCase() + d.slice(1);
    const parseLoc = location.charAt(0).toUpperCase() + location.slice(1);
    const responseString = `\`\`\`
      ----------------------------------------------
      | Weather in ${parseLoc} on ${parsedDay}:         
      ----------------------------------------------
      | Description: ${weather.padEnd(10, " ")}
      | Temperature: ${temperatureCelsius.toString().padEnd(2, " ")} °C  
      | Feels like: ${feelsLikeCelsius.toString().padEnd(2, " ")} °C    
      | Humidity: ${humidity.toString().padEnd(2, " ")} %         
      ----------------------------------------------
      \`\`\``;

    return responseString;
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw new Error("Error fetching weather");
  }
}

module.exports = { getWeather };
