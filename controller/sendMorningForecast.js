const util = require("util");
const db = require("../config/dbConfig");
const axios = require("axios");
const { EmbedBuilder } = require("discord.js");
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
        const embedMssg = new EmbedBuilder()
          .setColor(0x6ca0d9)
          .setTitle(`Hi ${name} Good Morning 😃`)
          .setDescription(`Weather report for ${location} Today :-`)
          .addFields(
            {
              name: "Description",
              value: `${response.data.weather[0].description}`,
              inline: false,
            },
            {
              name: "Temperature",
              value: `${temp} °C`,
              inline: false,
            },
            {
              name: "Humidity",
              value: `${response.data.main.humidity} %`,
              inline: false,
            },
            {
              name: "Wind Speed",
              value: `${response.data.wind.speed} m/s`,
              inline: false,
            }
          )
          .setFooter({
            text: "Powered by Weathery",
            iconURL: process.env.GIF_URL,
          });

        return embedMssg;

        // return responseString;
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
