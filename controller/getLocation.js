const util = require("util");
const db = require("../config/dbConfig");
db.query = util.promisify(db.query);

const getLocation = async (message, id) => {
  try {
    let query = `SELECT location from user WHERE id = ${id}`;
    let result = await db.query(query);

    if (result.length > 0) {
      let location = result[0].location;
      if (location === null) {
        message.reply(
          `Hi ${message.author.username} you haven't setup you location kindly set it up using /setlocation command`
        );
        return;
      }
      location = location.charAt(0).toUpperCase() + location.slice(1);
      message.reply(
        `Hi ${message.author.username} your current location is ${location}`
      );
    } else {
      message.reply("Sorry no data available!");
    }
  } catch (error) {
    console.error("Error occurred!", error);
    message.reply("Error occurred, please try again after sometime");
  }
};

module.exports = { getLocation };
