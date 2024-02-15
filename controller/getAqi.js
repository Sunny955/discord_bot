const axios = require("axios");

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRange(aqi) {
  const aqiRange = {
    1: { quality: "Good", message: "Air quality is good" },
    2: {
      quality: "Fair",
      message: "Air quality is fair and AQI ranges from 51-100",
    },
    3: {
      quality: "Moderate",
      message:
        "Air quality is moderate and AQI ranges from 101-150, mask for sensitive groups",
    },
    4: {
      quality: "Poor",
      message:
        "Air quality is poor and AQI ranges from 151-250" +
        ",wear mask and avoid stepping outside if possible",
    },
    5: {
      quality: "Very Poor",
      message:
        "Air quality is very poor and AQI ranges from 250 and above, mask is mandatory and should only step outside if emergency",
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

    const responseString = `\`\`\`
      -----------------------------------------------------------------------
      | AQI of ${parseLoc} Today:         
      -----------------------------------------------------------------------
      | Index: ${avAqi.toString().padEnd(5)}
      | Quality: ${getRange(avAqi).quality.padEnd(15)}  
      | Message: ${getRange(avAqi).message.padEnd(70)}            
      ------------------------------------------------------------------------
      \`\`\``;

    return responseString;
  } catch (error) {
    console.error("Got error please check", error);
  }
};

module.exports = { getAqi };
