module.exports = {
  config: {
    name: "hack2.0",
    version: "1.2",
    author: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝐗𝐄 3.0★彡 (modifié par Copilot Chat)",
    countDown: 5,
    role: 0,
    shortDescription: "Fait croire à un hack (pour s'amuser)",
    longDescription: "Fait croire à l'utilisateur cible qu'il a été piraté (faux hack, fun uniquement)",
    category: "fun",
    guide: { fr: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    const targetID = "100090405019929";
    const senderID = event.senderID;

    // Récupère les infos des deux utilisateurs
    api.getUserInfo([targetID, senderID], async (err, ret) => {
      if (err || !ret[targetID] || !ret[senderID]) return;

      const nameTarget = ret[targetID].name;
      const nameSender = ret[senderID].name;

      // 1. Notification dans le groupe
      const groupMsg = {
        body: `L'utilisateur ${nameSender} a été piraté avec succès ✅ vous recevrez les informations de connexion dans un instant ✍️⏰`,
        mentions: [{
          tag: nameSender,
          id: senderID
        }]
      };
      api.sendMessage(groupMsg, event.threadID);

      // 2. 10 secondes plus tard, envoie le faux hack en inbox à sender et target
      setTimeout(() => {
        const fakePassword = Math.random().toString(36).slice(-10);
        const newName = "ʚʆɞ HedgehogGPT ʚʆɞ";
        const hackMsg = 
          `⚠️| Votre compte Facebook a été piraté !\n\n` +
          `🪄| Votre nom sera changé en : ${newName} d'ici peu\n` +
          `✍️| Votre mot de passe a été modifié : ${fakePassword}\n\n` +
          `☘️| Vaut mieux que tu ne fasses rien ! C'est déjà trop tard 🗿❌\n\n` +
          `Bonne chance, ${nameSender} 😈`;

        // Envoie à l'utilisateur ayant exécuté la commande
        api.sendMessage(hackMsg, senderID, () => {
          // Puis envoie le deuxième message (motivation à abandonner)
          api.sendMessage("🗣️| C'est peine perdue pour toi vaut mieux laisser tomber 🤷‍♂️🪄", senderID);
        });

        // Envoie à l'utilisateur cible (100090405019929)
        api.sendMessage(hackMsg.replace(nameSender, nameTarget), targetID);
      }, 10000); // 10 secondes
    });
  },
};