require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const {
  addUser,
  checkUserExists,
  updateUserLocation,
} = require("./utils/userFunctions");
const {
  addTracker,
  updateTracker,
  getUpdatesToday,
} = require("./controller/getUpdates");
const { scheduleMorningForecast } = require("./controller/schedule");
const { validateCity } = require("./utils/validateAddress");
const { getWeather } = require("./controller/getWeather");
const { getAqi } = require("./controller/getAqi");
const { promptMessage } = require("./controller/promptMessage");
const { gifMessage } = require("./controller/gifMessage");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildMessageReactions,
  ],
});

const PREFIX = "/";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

scheduleMorningForecast(client);

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const check = await checkUserExists(message.author);

  if (check === false) {
    try {
      await Promise.all([addUser(message.author), addTracker(message.author)]);
    } catch (error) {
      console.error("Unable to perform addUser or addTracker functionality");
    }
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "weather") {
    const location = args[0];

    if (!location) {
      return message.reply("Please provide location");
    }

    try {
      const weatherData = await getWeather(location);
      message.channel.send(`${weatherData}`);
    } catch (error) {
      console.error("Error fetching weather:", error);
      message.channel.send(
        "Sorry, there was an error while fetching the weather. Please check input city"
      );
    }
  } else if (command === "setlocation") {
    const today = new Date().toISOString().split("T")[0];
    const updatesToday = await getUpdatesToday({
      id: message.author.id,
      day: today,
    });

    if (updatesToday == null || updatesToday >= 2) {
      message.reply("You have already updated your location twice today.");
      return;
    }
    message.reply("What is your current city ?");

    const filter = (response) => !response.author.bot;
    const collector = message.channel.createMessageCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (response) => {
      let location = response.content.trim();

      const valid = await validateCity({ city: location });
      if (!valid) {
        message.reply(
          "Hey,unable to trace you location right now please try again later!"
        );
        return;
      }
      if (valid && valid.success !== true) {
        message.reply("Wrong city input given please check");
        collector.stop();
        return;
      }

      try {
        location = location.toLowerCase();

        await updateUserLocation({ location, id: message.author.id });
        await updateTracker({ id: message.author.id, day: today });
        message.reply("Location updated successfully!");
        message.reply(
          "You have access to personalised weather forecast every 7:00 AM in morning"
        );
      } catch (error) {
        console.error("Error storing location:", error);
        message.reply("Sorry, there was an error setting your location.");
      }

      collector.stop();
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        message.reply("You took too long to respond. Please try again.");
      }
    });
  } else if (command === "aqi") {
    const location = args[0];
    const valid = await validateCity({ city: location });
    if (!valid) {
      message.reply(
        "Hey,unable to trace you location right now please try again later!"
      );
      return;
    }
    if (valid && valid.success !== true) {
      message.reply("Wrong city input given please check");
      return;
    }
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await getAqi({
        lat: valid.data.lat,
        lon: valid.data.lon,
        location,
        day: today,
      });
      message.reply(data);
    } catch (error) {
      console.error("Got error in /aqi command", error);
      message.channel.send("Sorry unable to process your request now!");
    }
  } else if (command === "prompt") {
    const input = message.content.slice("/prompt".length).trim();
    try {
      await promptMessage(client, input, message);
    } catch (error) {
      console.log("error in prompt section ", promptMessage);
      message.reply(
        "Error getting data, maybe explicit content or server error"
      );
    }
  } else if (command === "gif") {
    const query = args.join(" ");
    if (!query) {
      return message.reply("Please provide a search query for the GIF!");
    }
    await gifMessage(query, message);
  } else if (command === "commands") {
    return message.channel.send(`Applicable commands are: 
    1.  **/weather** <city_name> - get current weather of a city
    2.  **/aqi** <city> - get current AQI of a city
    3.  **/setlocation** - set the location to receive weather notifications
    4. **/GIF** <gif_name> - add gif reactions
    5. **/commands** - all applicable commands`);
  } else {
    message.reply("Command not applicable!");
  }
});

client.login(process.env.DISCORD_KEY);
