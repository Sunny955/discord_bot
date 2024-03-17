const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

const gifMessage = async (query, message) => {
  try {
    const response = await axios.get("http://api.giphy.com/v1/gifs/search", {
      params: {
        api_key: process.env.GIF_KEY,
        q: query,
        limit: 10,
        rating: "r",
      },
    });

    const gifUrls = response.data.data.map((gif) => gif.images.original.url);

    const gifTitle = "GIFs";

    const embeds = gifUrls.map((gifUrl, index) => {
      const embed = new EmbedBuilder();
      embed.setTitle(gifTitle);
      embed.setURL(gifUrl);
      embed.setDescription(`${index + 1}/${gifUrls.length}`);
      embed.setThumbnail(gifUrl);
      embed.setFooter({
        text: `Powered by Giphy | Query: ${query}`,
        iconURL: "https://i.imgur.com/9QaZdB8.png",
      });
      return embed;
    });

    const embedMessage = await message.channel.send({ embeds: embeds });

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

    for (let emoji of emojis) {
      await embedMessage.react(emoji);
    }

    const filterNow = (reaction, user) => {
      return (
        emojis.includes(reaction.emoji.name) && user.id === message.author.id
      );
    };

    const collector = embedMessage.createReactionCollector({
      filter: filterNow,
      time: 60_000,
      max: 1,
    });

    collector.on("collect", (reaction, user) => {
      const index = emojis.indexOf(reaction.emoji.name);
      const selectedGifUrl = gifUrls[index];
      message.channel.send(selectedGifUrl);
      embedMessage.delete();
      collector.stop();
    });

    collector.on("end", (collected, reason) => {
      // If the collector timed out, send a message to the user
      if (reason === "time") {
        message.channel.send("You did not choose a GIF in time!");
        embedMessage.delete();
      }
    });
  } catch (error) {
    console.error("Error fetching GIF:", error);
    message.channel.send("Sorry, unable to fetch a GIF at the moment!");
  }
};

module.exports = { gifMessage };
