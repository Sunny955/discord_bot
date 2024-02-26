const cron = require("node-cron");
const axios = require("axios");
const util = require("util");
const db = require("../config/dbConfig");
db.query = util.promisify(db.query);

async function fetchUsers() {
  try {
    const query = "SELECT id,location FROM user WHERE location IS NOT NULL";
    const output = await db.query(query);

    return output;
  } catch (err) {
    console.log("Oops! error occurred getting users");
    throw error;
  }
}

async function fetchWeather(location) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&cnt=40&appid=${process.env.API_KEY}`;
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching weather data for location '${location}':`,
      error
    );
    throw error;
  }
}

async function checkWeatherChange(location) {
  try {
    const weather = await fetchWeather(location);
    if (!weather || !weather.list || weather.list.length < 3) {
      console.error("Invalid weather data:", weather);
      return;
    }
    let prevWeather = weather.list[0];
    const currentHrs = new Date().getHours();
    let currentWeather;
    if (currentHrs % 3 === 0) {
      currentWeather = weather.list[1];
    } else {
      prevWeather = weather.list[1];
      currentWeather = weather.list[2];
    }

    return { prev: prevWeather, curr: currentWeather };
  } catch (error) {
    console.log("error occurred in weather change", error);
    throw error;
  }
}

const backgroundJob = (client) => {
  cron.schedule("0 */3 * * *", async () => {
    try {
      const users = await fetchUsers();

      if (!users || users.length === 0) {
        console.log("No users found. Skipping background job.");
        return;
      }

      for (const row of users) {
        const { id, location } = row;
        let { prev, curr } = await checkWeatherChange(location);
        const user = await client.users.fetch(id);
        const temperatureCelsius = (curr.main.temp - 273.15).toFixed(2);
        const date_time = curr.dt_txt.split(" ");
        const time12 = new Date(
          `2000-01-01T${date_time[1]}`
        ).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        if (
          prev !== null &&
          curr !== null &&
          prev.weather[0].description !== curr.weather[0].description
        ) {
          user.send(
            `\`\`\`
        -----------------------------------------------------
        | Hey there weather is changing, Please take a look :  
        -----------------------------------------------------
        | Description: ${curr.weather[0].description}  
        | Temperature: ${temperatureCelsius} °C      
        | Wind Speed: ${curr.wind.speed} m/s     
        | Humidity: ${curr.main.humidity} %    
        | Date : ${date_time[0]}  
        | Time : ${time12}    
        -----------------------------------------------------
        \`\`\``
          );
        }
      }

      console.log(
        `Background job ran successfully at ${new Date().toLocaleTimeString()}`
      );
    } catch (error) {
      console.error("Error running background job:", error);
    }
  });
};

module.exports = { backgroundJob };
