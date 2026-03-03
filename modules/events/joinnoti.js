module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "3.5.0",
  credits: "Cake Country",
  description: "Join Premium Stable",
};

module.exports.run = async function ({ api, event, Users }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const Canvas = require("canvas");
  const moment = require("moment-timezone");

  const { threadID, logMessageData } = event;
  const botID = api.getCurrentUserID();

  try {

    // ===== BOT VÀO NHÓM =====
    if (logMessageData.addedParticipants.some(i => i.userFbId == botID)) {
      const bannerPath = __dirname + "/cache/bot_banner.png";

      api.changeNickname(
        `⟬ ${global.config.PREFIX} ⟭ ➣ ${(!global.config.BOTNAME) ? "Made by Khôi" : global.config.BOTNAME}`,
        threadID,
        botID
      );

      return api.sendMessage({
        body:
`🌸━━━━━━━━━━━━━━━━━━🌸
✨ 𝐊𝐄̂́𝐓 𝐍𝐎̂́𝐈 𝐓𝐇𝐀̀𝐍𝐇 𝐂𝐎̂𝐍𝐆 ✨
🌸━━━━━━━━━━━━━━━━━━🌸

🤖 Bot đã sẵn sàng hoạt động!
📌 Prefix: ${global.config.PREFIX}
💎 Gõ help để xem lệnh`,
        attachment: fs.existsSync(bannerPath) ? fs.createReadStream(bannerPath) : null
      }, threadID);
    }

    // ===== MEMBER VÀO =====
    const { threadName, participantIDs } = await api.getThreadInfo(threadID);

    for (let newMem of logMessageData.addedParticipants) {
      const uid = newMem.userFbId;
      if (uid == botID) continue;

      const name = await Users.getNameUser(uid);
      const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");

      const canvas = Canvas.createCanvas(1200, 630);
      const ctx = canvas.getContext("2d");

      // ===== BACKGROUND CHỐNG MÉO =====
      const bgPath = __dirname + "/cache/join_bg.png";
      if (!fs.existsSync(bgPath)) {
        console.log("Thiếu join_bg.png");
        return;
      }

      const background = await Canvas.loadImage(bgPath);

      let imgRatio = background.width / background.height;
      let canvasRatio = canvas.width / canvas.height;
      let renderW, renderH, x, y;

      if (imgRatio > canvasRatio) {
        renderH = canvas.height;
        renderW = background.width * (canvas.height / background.height);
        x = (canvas.width - renderW) / 2;
        y = 0;
      } else {
        renderW = canvas.width;
        renderH = background.height * (canvas.width / background.width);
        x = 0;
        y = (canvas.height - renderH) / 2;
      }

      ctx.drawImage(background, x, y, renderW, renderH);

      // ===== LOAD AVATAR =====
      let avatarImg;
      try {
        const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
        avatarImg = await Canvas.loadImage(Buffer.from(res.data));
      } catch {
        avatarImg = null;
      }

      // ===== VẼ AVATAR =====
      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(600, 315, 160, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const size = Math.min(avatarImg.width, avatarImg.height);
        const sx = (avatarImg.width - size) / 2;
        const sy = (avatarImg.height - size) / 2;

        ctx.drawImage(avatarImg, sx, sy, size, size, 440, 155, 320, 320);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(600, 315, 160, 0, Math.PI * 2);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      }

      // ===== TEXT STYLE =====
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 15;

      ctx.font = "bold 45px sans-serif";
      ctx.fillText("CHÀO MỪNG THÀNH VIÊN MỚI", 600, 90);

      ctx.font = "35px sans-serif";
      ctx.fillText(`Nhóm: ${threadName}`, 600, 150);
      ctx.fillText(`Thành viên hiện tại: ${participantIDs.length}`, 600, 200);

      // ===== AUTO CO TÊN =====
      function drawAutoName(text, maxWidth) {
        let fontSize = 50;
        do {
          ctx.font = `bold ${fontSize}px sans-serif`;
          fontSize--;
        } while (ctx.measureText(text).width > maxWidth && fontSize > 25);
        ctx.fillText(text, 600, 520);
      }

      drawAutoName(name, 1000);

      ctx.font = "25px sans-serif";
      ctx.fillText(time, 600, 580);

      ctx.shadowBlur = 0;

      const pathSave = __dirname + `/cache/join_${uid}.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer());

      await api.sendMessage({
        body:
`🌿━━━━━━━━━━━━━━━━━━🌿
🎉 𝐂𝐇𝐀̀𝐎 𝐌𝐔̛̀𝐍𝐆 𝐓𝐇𝐀̀𝐍𝐇 𝐕𝐈𝐄̂𝐍 🎉
🌿━━━━━━━━━━━━━━━━━━🌿

👤 ${name}
🏷 Nhóm: ${threadName}
⏰ ${time}

Chúc bạn có những phút giây vui vẻ ✨`,
        mentions: [{ tag: name, id: uid }],
        attachment: fs.createReadStream(pathSave)
      }, threadID);

      fs.unlinkSync(pathSave);
    }

  } catch (err) {
    console.log("JOIN ERROR:", err);
  }
};
