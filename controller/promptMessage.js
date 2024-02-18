const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

const promptMessage = async (client, input, message) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = input;

  if (
    prompt === "what is your name?" ||
    prompt === "what's your name?" ||
    prompt === "What's your name?" ||
    prompt === "What is your name?"
  ) {
    message.reply("Hi! My name is Weathery, made for weather assistant!");
    return;
  }

  if (input.length === 0) {
    message.reply("Empty message 😅");
    return;
  }

  if (input.length <= 1) {
    message.reply("Can you please elaborate it more for me 😃?");
    return;
  }

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  const maxLen = 2000;
  while (text.length > maxLen) {
    let lastSpaceIndex = text.substring(0, maxLen).lastIndexOf(" ");
    if (lastSpaceIndex === -1) lastSpaceIndex = maxLen;
    const currMessage = text.substring(0, lastSpaceIndex);
    text = text.substring(lastSpaceIndex).trim();
    message.reply(currMessage);
  }
  if (text.length > 0) {
    message.reply(text);
  }
};

module.exports = { promptMessage };
