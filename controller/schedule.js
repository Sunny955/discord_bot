const cron = require("node-cron");
const util = require("util");
const { sendMorningForecast } = require("./sendMorningForecast");
const db = require("../config/dbConfig");
db.query = util.promisify(db.query);

const scheduleMorningForecast = (client) => {
  cron.schedule("0 7 * * *", async () => {
    try {
      const query = "SELECT id FROM user WHERE location IS NOT NULL";
      const output = await db.query(query);

      for (const row of output) {
        const { id } = row;
        const output = await sendMorningForecast({ id });
        const user = await client.users.fetch(id);
        user.send(output);
      }

      console.log("Morning forecast sent to all users successfully");
    } catch (error) {
      console.error("Error sending morning forecast:", error);
    }
  });
};
module.exports = { scheduleMorningForecast };
