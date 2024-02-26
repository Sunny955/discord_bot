const axios = require("axios");
async function getWeather(location) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&cnt=8&appid=${process.env.API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data;

    const top3 = data.list.slice(0, 3);
    const currentHr = new Date().getHours();
    let index = 0;

    for (let element of top3) {
      let hrs = new Date(element.dt_txt).getHours();
      if (hrs === 0) {
        hrs = 24;
      }
      if (currentHr <= hrs) {
        break;
      }
      index++;
    }

    const weather = top3[index].weather[0].description;
    const temperature = top3[index].main.temp;
    const feelsLike = top3[index].main.feels_like;
    const humidity = top3[index].main.humidity;
    const windSpeed = top3[index].wind.speed;
    const temperatureCelsius = (temperature - 273.15).toFixed(2);
    const feelsLikeCelsius = (feelsLike - 273.15).toFixed(2);
    const parsedDay = "Today";
    const parseLoc = location.charAt(0).toUpperCase() + location.slice(1);
    const responseString = `\`\`\`
      ----------------------------------------------
      | Weather in ${parseLoc} ${parsedDay}:         
      ----------------------------------------------
      | Description: ${weather.padEnd(10, " ")}
      | Temperature: ${temperatureCelsius.toString().padEnd(2, " ")} °C  
      | Feels like: ${feelsLikeCelsius.toString().padEnd(2, " ")} °C    
      | Humidity: ${humidity.toString().padEnd(2, " ")} % 
      | Wind Speed: ${windSpeed.toString().padEnd(2, " ")} m/s        
      ----------------------------------------------
      \`\`\``;

    return responseString;
  } catch (error) {
    console.log("Error fetching weather:", error);
    throw new Errror(error);
  }
}

module.exports = { getWeather };
