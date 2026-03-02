module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "3.0.0",
  credits: "Cake Country",
  description: "Join Premium + Auto Set Name",
};

module.exports.run = async function ({ api, event, Users }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const Canvas = require("canvas");
  const moment = require("moment-timezone");

  const { threadID } = event;
  const botID = api.getCurrentUserID();

  try {

    // ===== BOT ĐƯỢC THÊM =====
    if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {

  const fs = require("fs-extra");
  const path = __dirname + "/cache/bot_banner.png"; // ảnh banner của m

  // ===== AUTO SET NICKNAME =====
  api.changeNickname(
    `⟬ ${global.config.PREFIX} ⟭ ➣ ${(!global.config.BOTNAME) ? "Made by Khôi" : global.config.BOTNAME}`,
    threadID,
    api.getCurrentUserID()
  );

  // ===== GỬI ẢNH + TIN NHẮN =====
  return api.sendMessage({
    body:
`🌸━━━━━━━━━━━━━━━━━━🌸
✨ 𝐊𝐄̂́𝐓 𝐍𝐎̂́𝐈 𝐓𝐇𝐀̀𝐍𝐇 𝐂𝐎̂𝐍𝐆 ✨
🌸━━━━━━━━━━━━━━━━━━🌸

🤖 Bot đã sẵn sàng hoạt động!

📌 Prefix: ${global.config.PREFIX}
💎 Gõ help để xem lệnh
🔥 Chúc nhóm hoạt động vui vẻ`,
    attachment: fs.existsSync(path) ? fs.createReadStream(path) : null
  }, threadID);

    }

    // ===== MEMBER THƯỜNG VÀO =====
    const { threadName, participantIDs } = await api.getThreadInfo(threadID);

    const uid = event.logMessageData.addedParticipants[0].userFbId;
    const name = await Users.getNameUser(uid);
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");

    const canvas = Canvas.createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    // ===== BACKGROUND =====
    const background = await Canvas.loadImage(__dirname + "/cache/join_bg.png");

    const canvasRatio = 1200 / 630;
    const bgRatio = background.width / background.height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (bgRatio > canvasRatio) {
      drawHeight = 630;
      drawWidth = background.width * (630 / background.height);
      offsetX = (1200 - drawWidth) / 2;
      offsetY = 0;
    } else {
      drawWidth = 1200;
      drawHeight = background.height * (1200 / background.width);
      offsetX = 0;
      offsetY = (630 - drawHeight) / 2;
    }

    ctx.drawImage(background, offsetX, offsetY, drawWidth, drawHeight);

    // ===== AVATAR =====
    const avatarURL = `https://graph.facebook.com/${uid}/picture?type=large`;
    const avatar = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(avatar.data));

    const size = Math.min(avatarImg.width, avatarImg.height);
    const sx = (avatarImg.width - size) / 2;
    const sy = (avatarImg.height - size) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 315, 160, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, sx, sy, size, size, 440, 155, 320, 320);
    ctx.restore();

    ctx.beginPath();
    ctx.arc(600, 315, 160, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    // ===== TEXT =====
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 18;

    ctx.font = "bold 45px Arial";
    ctx.fillText("CHÀO MỪNG THÀNH VIÊN MỚI", 600, 90);

    ctx.font = "38px Arial";
    ctx.fillText(`Thành viên hiện tại: ${participantIDs.length}`, 600, 150);
    ctx.fillText(`Nhóm: ${threadName}`, 600, 200);

    ctx.font = "bold 45px Arial";
    ctx.fillText(name, 600, 520);

    ctx.font = "25px Arial";
    ctx.fillText("Đã tham gia nhóm", 600, 560);
    ctx.fillText(time, 600, 600);

    ctx.shadowBlur = 0;

    const pathSave = __dirname + `/cache/join_${uid}.png`;
    fs.writeFileSync(pathSave, canvas.toBuffer());

    await api.sendMessage({
      body:
`🌿━━━━━━━━━━━━━━━━━━🌿
🎉 𝐂𝐇𝐀̀𝐎 𝐌𝐔̛̀𝐍𝐆 𝐓𝐇𝐀̀𝐍𝐇 𝐕𝐈𝐄̂𝐍 🎉
🌿━━━━━━━━━━━━━━━━━━🌿

👤 ${name}
📌 Đã tham gia nhóm

🏷 Nhóm: ${threadName}
⏰ ${time}

Chúc bạn có những phút giây vui vẻ ✨`,
      mentions: [{
        tag: name,
        id: uid
      }],
      attachment: fs.createReadStream(pathSave)
    }, threadID);

    fs.unlinkSync(pathSave);

  } catch (err) {
    console.log("JOIN ERROR:", err);
  }
};
