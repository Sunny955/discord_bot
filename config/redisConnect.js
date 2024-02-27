const redis = require("redis");

const client = redis.createClient({
  password: process.env.REDIS_DB_PASS,
  socket: {
    host: "redis-18155.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 18155,
  },
});

client
  .connect()
  .then(() => {
    console.log("Connected to Redis!");
  })
  .catch((err) => {
    console.log("error", err);
  });

module.exports = { client };
