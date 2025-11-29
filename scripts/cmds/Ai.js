const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

function convertToBold(text) {
  const boldMap = {
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
    k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁",
    u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝",
    K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧",
    U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
  };
  return text.split("").map(ch => boldMap[ch] || ch).join("");
}

let userUsage = {};
let bannedUsers = new Set();
const badWords = ["bobo", "tanga", "gago", "ulol", "pakyu", "puke", "putangina", "puta", "kantot"];

function getCurrentTime() {
  return new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
}

function sendTemp(api, threadID, message) {
  return new Promise(resolve => {
    api.sendMessage(message, threadID, (err, info) => resolve(info));
  });
}

module.exports = {
  config: {
    name: "ai",
    version: "3.0",
    aliases: ["gpt","ask"],
    author: "thataone",
    countDown: 3,
    role: 0,
    shortDescription: "Chat with LLaMA AI",
    longDescription: "Ask questions or chat with the model.",
    category: "ai",
    guide: { en: "{pn} [your question]\n{pn} reset — reset usage" },
  },

  onStart: async function ({ api, event, args }) {
    const uid = event.senderID;
    const threadID = event.threadID;
    const messageID = event.messageID;
    const input = args.join(" ").trim();
    const command = args[0]?.toLowerCase();

    if (command === "reset") {
      userUsage[uid] = 0;
      bannedUsers.delete(uid);
      return api.sendMessage("✅ Your usage and ban status have been reset.", threadID, messageID);
    }

    if (bannedUsers.has(uid)) {
      return api.sendMessage("❌ You are banned.\nType 'ai reset' to unban.", threadID, messageID);
    }

    if (badWords.some(w => input.toLowerCase().includes(w))) {
      bannedUsers.add(uid);
      return api.sendMessage("🚫 Inappropriate language detected. You are banned.\nType 'ai reset' to unban.", threadID, messageID);
    }
    userUsage[uid] = userUsage[uid] || 0;
    if (userUsage[uid] >= 9) {
      return api.sendMessage("⚠️ Limit reached (9/9).\nType 'ai reset' to reset.", threadID, messageID);
    }

    if (!input) return api.sendMessage("❓ Please provide a message.", threadID, messageID);

    const tempMsg = await sendTemp(api, threadID, "⚡ Generating fast response...");

    try {
      const { data } = await axios.get(
        "https://betadash-api-swordslush-production.up.railway.app/Llama70b",
        { params: { ask: input, uid } }
      );

      userUsage[uid]++;

      const formatted = data.response
        .replace(/\*\*(.*?)\*\*/g, (_, t) => convertToBold(t))
        .replace(/##(.*?)##/g, (_, t) => convertToBold(t))
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      const reply =
        `✨ ${convertToBold("Kyles Chatbot")}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📌 ${convertToBold("Prompt")}: ${input}\n\n` +
        `📨 ${convertToBold("Answer")}:\n${formatted}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🕒 ${convertToBold("Time")}: ${getCurrentTime()}\n` +
        `🧠 ${convertToBold("Usage")}: ${userUsage[uid]}/9`;

      if (api.editMessage) {
        return api.editMessage(reply, tempMsg.messageID, threadID);
      } else {
        api.unsendMessage(tempMsg.messageID);
        return api.sendMessage(reply, threadID);
      }

    } catch (err) {
      console.error("AI Error:", err.message);

      if (api.editMessage) {
        return api.editMessage("❌ Error processing your request.", tempMsg.messageID, threadID);
      } else {
        api.unsendMessage(tempMsg.messageID);
        return api.sendMessage("❌ Error processing your request.", threadID);
      }
    }
  },
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });