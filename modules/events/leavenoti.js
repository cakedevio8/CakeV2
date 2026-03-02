module.exports.config = {
  name: "leavenoti",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "Cake Country",
  description: "Leave Premium Image",
};

module.exports.run = async function ({ api, event, Users }) {
  const fs = require("fs-extra");
  const axios = require("axios");
  const Canvas = require("canvas");
  const moment = require("moment-timezone");

  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  const { threadID } = event;

  try {
    const { threadName, participantIDs } = await api.getThreadInfo(threadID);

    const uid = event.logMessageData.leftParticipantFbId;
    const name = await Users.getNameUser(uid);
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");

    const type = (event.author == uid)
      ? "Đã tự rời khỏi nhóm"
      : "Đã bị quản trị viên xóa khỏi nhóm";

    const canvas = Canvas.createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    // ===== LOAD BACKGROUND =====
    const background = await Canvas.loadImage(__dirname + "/cache/leave_bg.png");
    ctx.drawImage(background, 0, 0, 1200, 630);

    // ===== LOAD AVATAR =====
const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
const avatar = await axios.get(avatarURL, { responseType: "arraybuffer" });
const avatarImg = await Canvas.loadImage(Buffer.from(avatar.data));

// ===== CROP ẢNH TRÁNH MÉO =====
const size = Math.min(avatarImg.width, avatarImg.height);
const sx = (avatarImg.width - size) / 2;
const sy = (avatarImg.height - size) / 2;

// ===== VẼ AVATAR TRÒN + VIỀN =====
ctx.save();
ctx.beginPath();
ctx.arc(600, 315, 160, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatarImg, sx, sy, size, size, 440, 155, 320, 320);
ctx.restore();

// Viền trắng
ctx.beginPath();
ctx.arc(600, 315, 160, 0, Math.PI * 2);
ctx.lineWidth = 8;
ctx.strokeStyle = "#ffffff";
ctx.stroke();
    // ===== BÓNG ĐỔ =====
    ctx.textAlign = "center";
    ctx.fillStyle = "#2e4f2e";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    // ===== CHỮ PHÍA TRÊN =====
    ctx.font = "bold 55px Arial";
    ctx.fillText("Tạm biệt thành viên", 600, 90);

    ctx.font = "42px Arial";
    ctx.fillText(`Thành viên hiện tại: ${participantIDs.length}`, 600, 150);

    ctx.fillText(`Nhóm: ${threadName}`, 600, 200);

    // ===== CHỮ PHÍA DƯỚI =====
    ctx.font = "bold 50px Arial";
    ctx.fillText(name, 600, 520);

    ctx.font = "30px Arial";
    ctx.fillText(type, 600, 560);

    ctx.fillText(time, 600, 600);

    ctx.shadowBlur = 0;

    const pathSave = __dirname + `/cache/leave_${uid}.png`;
    fs.writeFileSync(pathSave, canvas.toBuffer());

    // ===== TIN NHẮN ĐẸP =====
    await api.sendMessage({
      body:
`🍃━━━━━━━━━━━━━━━━━━🍃
💔 𝐓𝐀̣𝐌 𝐁𝐈𝐄̣̂𝐓 𝐓𝐇𝐀̀𝐍𝐇 𝐕𝐈𝐄̂𝐍 💔
🍃━━━━━━━━━━━━━━━━━━🍃

👤 ${name}
📌 ${type}

🏷 Nhóm: ${threadName}
⏰ ${time}

Chúc bạn mọi điều tốt đẹp 🌿`,
      mentions: [{
        tag: name,
        id: uid
      }],
      attachment: fs.createReadStream(pathSave)
    }, threadID);

    fs.unlinkSync(pathSave);

  } catch (err) {
    console.log(err);
  }
};
