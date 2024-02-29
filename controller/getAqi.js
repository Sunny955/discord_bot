const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRange(aqi) {
  const aqiRange = {
    1: {
      quality: "Good",
      message: "Air quality is good",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTk0YXV3M21wNDhldndnamwzaGphZmphcHRydzY4ZjN2MGNhMDhkZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jI77q8Mc5yOs5wncJe/giphy.gif",
    },
    2: {
      quality: "Fair",
      message: "Air quality is fair and AQI ranges from 51-100",
      url: "https://media.giphy.com/media/kbJyhJGNBpKRxvMXCE/giphy-downsized-large.gif",
    },
    3: {
      quality: "Moderate",
      message:
        "Air quality is moderate and AQI ranges from 101-150, mask for sensitive groups",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajJxendwdWU1Y3c1NTAzaTZlcGh1NmR1cDRuaXZtZG45dGw2Z3M1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cZb6tq2MFotjDzRTUu/giphy.gif",
    },
    4: {
      quality: "Poor",
      message:
        "Air quality is poor and AQI ranges from 151-250" +
        ",wear mask and avoid stepping outside if possible",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDlqdHh4ZTh4dTdpaGlsaDlnbnA0cHJ0NWJobXJlMHFweDZwdnJuaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9GIEZ60FUeeSAPyltp/giphy.gif",
    },
    5: {
      quality: "Very Poor",
      message:
        "Air quality is very poor and AQI ranges from 250 and above, mask is mandatory and should only step outside if emergency",
      url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXUyNTZ6cGM2aWhkN21mdmh1d2o4cnU3OTZxYTB5bm14aGd2aDhuZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eCqsfF7Fh8dsjgfLWY/giphy.gif",
    },
  };

  return aqiRange[aqi];
}

const getAqi = async (data) => {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${data.lat}&lon=${data.lon}&appid=${process.env.API_KEY}`;
  try {
    const response = await axios.get(url);
    const aqiData = response.data.list;
    let aqi = 0;
    let count = 0;
    for (let d of aqiData) {
      const new_date = formatDate(d.dt.toString());
      if (new_date == data.day) {
        aqi += d.main.aqi;
        count++;
      }
    }
    let avAqi = Math.floor(aqi / count);
    const parseLoc =
      data.location.charAt(0).toUpperCase() + data.location.slice(1);

    const embedMssg = new EmbedBuilder()
      .setColor(0x6ca0d9)
      .setTitle(`AQI of ${parseLoc} Today:-`)
      .setThumbnail(getRange(avAqi).url)
      .addFields(
        {
          name: "Index",
          value: `${avAqi.toString().padEnd(5)}`,
          inline: false,
        },
        {
          name: "Quality",
          value: `${getRange(avAqi).quality.padEnd(15)}`,
          inline: false,
        },
        {
          name: "Message",
          value: `${getRange(avAqi).message.padEnd(15)}`,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: "Powered by Weathery",
        iconURL: process.env.GIF_URL,
      });
    return embedMssg;
  } catch (error) {
    console.error("Got error please check", error);
  }
};

module.exports = { getAqi };
