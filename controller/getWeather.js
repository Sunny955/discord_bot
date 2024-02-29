const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
async function getWeather(message, location) {
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

    const embedMssg = new EmbedBuilder()
      .setColor(0x6ca0d9)
      .setTitle(`Weather in ${parseLoc} ${parsedDay}:-`)
      .addFields(
        { name: "Description", value: `${weather}`, inline: false },
        {
          name: "Temperature",
          value: `${temperatureCelsius} °C`,
          inline: false,
        },
        { name: "Feels like", value: `${feelsLikeCelsius} °C`, inline: false },
        { name: "Humidity", value: `${humidity} %`, inline: false },
        { name: "Wind Speed", value: `${windSpeed} m/s`, inline: false }
      )
      .setTimestamp()
      .setFooter({
        text: "Powered by Weathery",
        iconURL: process.env.GIF_URL,
      });

    message.channel.send({ embeds: [embedMssg] });
  } catch (error) {
    console.log("Error fetching weather:", error);
    throw new Errror(error);
  }
}

module.exports = { getWeather };
