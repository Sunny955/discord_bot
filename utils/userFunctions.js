const db = require("../config/dbConfig");

const addUser = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      `INSERT INTO user (id, name, location) VALUES (?, ?, ?)`,
      [data.id, data.username, null],
      (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          reject(err);
        } else {
          console.log("User saved successfully!");
          resolve(result);
        }
      }
    );
  });
};

const checkUserExists = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) AS count FROM user WHERE id = ? OR name = ?`,
      [data.id, data.username],
      (err, result) => {
        if (err) {
          console.error("Error checking user existence:", err);
          reject(err);
        } else {
          const count = result[0].count;
          if (count > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
};

const updateUserLocation = (data) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE user SET location = ? WHERE id = ?`,
      [data.location, data.id],
      (err, result) => {
        if (err) {
          console.error("Error updating user location:", err);
          reject(err);
        } else {
          if (result.affectedRows > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    );
  });
};

module.exports = { addUser, checkUserExists, updateUserLocation };
