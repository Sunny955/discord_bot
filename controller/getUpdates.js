const util = require("util");
const db = require("../config/dbConfig");
db.query = util.promisify(db.query);

const addTracker = async (data) => {
  const today = new Date().toISOString().split("T")[0];
  try {
    let query = `INSERT INTO tracker (user_id,times,date) VALUES ('${data.id}',0,'${today}')`;
    let result = await db.query(query);

    if (result.affectedRows > 0) {
      console.log(`Data for user ${data.id} saved in tracker!`);
    } else {
      console.log("Data didn't saved successfully in tracker!");
    }
  } catch (error) {
    console.error("Error saving data to tracker:", error);
  }
};

const updateTracker = async (data) => {
  try {
    let query = `UPDATE tracker SET times = CASE WHEN date = '${data.day}' THEN times + 1 ELSE 1 END, date = '${data.day}' WHERE user_id = '${data.id}'`;
    let result = await db.query(query);

    if (result.affectedRows > 0) {
      console.log(
        `Tracker updated successfully for user ${data.id} on ${data.day}`
      );
    } else {
      console.log(`No tracker entry found for user ${data.id} on ${data.day}`);
    }
  } catch (error) {
    console.error("Error updating tracker:", error);
    throw error;
  }
};

const getUpdatesToday = async (data) => {
  try {
    let query = `SELECT times as total_updates from tracker WHERE user_id = '${data.id}' AND date = '${data.day}'`;
    let result = await db.query(query);

    if (result.length > 0) {
      return result[0].total_updates;
    } else {
      return -1;
    }
  } catch (err) {
    console.log("Error occurred while fetching data from database");
    return err;
  }
};

module.exports = { getUpdatesToday, addTracker, updateTracker };
