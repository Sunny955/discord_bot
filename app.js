require("dotenv").config();
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
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
const { backgroundJob } = require("./controller/background");
const { getLocation } = require("./controller/getLocation");
const isURL = require("is-url");
const qr = require("qrcode");
const dns = require("dns");
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
backgroundJob(client);

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
    let location;

    if (args[0] && args[1]) {
      location = args[0] + " " + args[1];
    } else if (args[0]) {
      location = args[0];
    }

    if (!location) {
      return message.reply("Please provide location");
    }

    try {
      await getWeather(message, location);
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
      message.channel.send({ embeds: [data] });
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
    try {
      const query = args.join(" ");
      if (!query) {
        return message.reply("Please provide a search query for the GIF!");
      }
      await gifMessage(query, message);
    } catch (error) {
      message.reply("Unable to process this command right now!");
    }
  } else if (command === "location") {
    try {
      await getLocation(message, message.author.id);
    } catch (error) {
      message.reply("Unable to process this command now");
    }
  } else if (command === "qr") {
    const link = args[0];

    if (!link) {
      return message.reply("Please provide a link to generate QR code.");
    }

    if (!isURL(link)) {
      return message.reply("Not a valid url, please check it once again!");
    }

    const domain = new URL(link).hostname;

    dns.resolve(domain, async (err) => {
      if (err) {
        console.error("Error resolving domain:", err);
        return message.reply(
          "Sorry, the domain does not exist or cannot be resolved."
        );
      } else {
        try {
          const qrCodeImage = await qr.toBuffer(link, { scale: 8 });
          const attachment = new AttachmentBuilder(qrCodeImage, {
            name: "qrcode.png",
          });
          const embed = new EmbedBuilder()
            .setTitle("QR Code")
            .setImage("attachment://qrcode.png")
            .setColor(0x0099ff);

          message.reply({ embeds: [embed], files: [attachment] });
        } catch (error) {
          console.error("Error generating QR code:", error);
          message.reply("Sorry, there was an error generating the QR code.");
        }
      }
    });
  } else if (command === "commands") {
    return message.channel.send(`Applicable commands are: 
    1.  **/weather** <city_name> - get current weather of a city
    2.  **/aqi** <city> - get current AQI of a city
    3.  **/setlocation** - set the location to receive weather notifications
    4.  **/location** - get current location of the user
    5. **/GIF** <gif_name> - add gif reactions
    6. **/commands** - all applicable commands
    7. **/qr** <URL> - generate QR for the given URL`);
  } else {
    message.reply("Command not applicable!");
  }
});

client.login(process.env.DISCORD_KEY);
