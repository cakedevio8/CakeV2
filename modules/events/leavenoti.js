module.exports.config = {
  name: "leavenoti",
  eventType: ["log:unsubscribe"],
  version: "2.2.0",
  credits: "Cake Country",
  description: "Leave Notification Premium Stable",
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
    const bgPath = __dirname + "/cache/leave_bg.png";
    if (!fs.existsSync(bgPath)) {
      console.log("Thiếu leave_bg.png");
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

    // ===== LOAD AVATAR (CHỐNG DEFAULT) =====
    let avatarImg;
    try {
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const res = await axios.get(avatarURL, { responseType: "arraybuffer" });
      avatarImg = await Canvas.loadImage(Buffer.from(res.data));
    } catch {
      try {
        const fallbackURL = `https://www.facebook.com/pfp/graph/?asid=${uid}&width=512&height=512`;
        const res2 = await axios.get(fallbackURL, { responseType: "arraybuffer" });
        avatarImg = await Canvas.loadImage(Buffer.from(res2.data));
      } catch {
        avatarImg = null;
      }
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
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }

    // ===== TEXT STYLE =====
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 15;

    ctx.font = "bold 45px Arial";
    ctx.fillText("TẠM BIỆT THÀNH VIÊN", 600, 90);

    ctx.font = "35px Arial";
    ctx.fillText(`Nhóm: ${threadName}`, 600, 150);
    ctx.fillText(`Thành viên còn lại: ${participantIDs.length}`, 600, 200);

    // ===== AUTO CO TÊN NẾU DÀI =====
    function drawAutoName(text, maxWidth) {
      let fontSize = 50;
      do {
        ctx.font = `bold ${fontSize}px Arial`;
        fontSize--;
      } while (ctx.measureText(text).width > maxWidth && fontSize > 25);
      ctx.fillText(text, 600, 520);
    }

    drawAutoName(name, 1000);

    ctx.font = "italic 30px Arial";
    ctx.fillText(type, 600, 570);

    ctx.font = "25px Arial";
    ctx.fillText(time, 600, 610);

    ctx.shadowBlur = 0;

    const pathSave = __dirname + `/cache/leave_${uid}.png`;
    fs.writeFileSync(pathSave, canvas.toBuffer());

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
      mentions: [{ tag: name, id: uid }],
      attachment: fs.createReadStream(pathSave)
    }, threadID);

    fs.unlinkSync(pathSave);

  } catch (err) {
    console.log("Lỗi LeaveNoti:", err);
  }
};
