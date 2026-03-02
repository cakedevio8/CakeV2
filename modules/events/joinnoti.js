const axios = require("axios");
const Canvas = require("canvas");
const fs = require("fs");
const moment = require("moment-timezone");

module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "2.0.0",
  credits: "Cake Country",
  description: "Thông báo người vào nhóm + kết nối autosetname"
};

module.exports.run = async function({ api, event, Threads }) {
  const { threadID } = event;

  const threadData = global.data.threadData.get(threadID) || {};
  if (threadData.joinNoti === false) return;

  // Nếu là bot vào thì bỏ qua (autosetname tự xử lý)
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {

  const canvas = Canvas.createCanvas(1200, 630);
  const ctx = canvas.getContext("2d");

  // nền
  const background = await Canvas.loadImage(__dirname + "/cache/background.png");
  ctx.drawImage(background, 0, 0, 1200, 630);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = "bold 70px Arial";
  ctx.fillText("⚡ BOT ĐÃ KẾT NỐI ⚡", 600, 250);

  ctx.font = "40px Arial";
  ctx.fillText("Sẵn sàng hoạt động trong nhóm này", 600, 330);

  ctx.font = "35px Arial";
  ctx.fillText(`Prefix: ${global.config.PREFIX}`, 600, 400);

  const pathSave = __dirname + `/cache/bot_join.png`;
  fs.writeFileSync(pathSave, canvas.toBuffer());

  await api.sendMessage({
    body: `✨═════[ KẾT NỐI THÀNH CÔNG ]═════✨
Bot đã vào nhóm và sẵn sàng phục vụ ❤️
Dùng ${global.config.PREFIX}help để xem lệnh.`,
    attachment: fs.createReadStream(pathSave)
  }, threadID);

  fs.unlinkSync(pathSave);
  return;
  }

    // ===========================
    // 🔥 GỌI AUTOSETNAME
    // ===========================
    try {
      const data = await Threads.getData(threadID);
      const prefix = data.data?.autosetname || "";

      if (prefix) {
        await api.changeNickname(`${prefix} ${name}`, threadID, uid);
      }
    } catch (e) {}

    // ===========================
    // 🎨 TẠO ẢNH WELCOME
    // ===========================
    const canvas = Canvas.createCanvas(1200, 630);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage(__dirname + "/cache/background.png");
    ctx.drawImage(background, 0, 0, 1200, 630);

    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
    const avatar = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const avatarImg = await Canvas.loadImage(Buffer.from(avatar.data));

    // Crop avatar cho khỏi méo
    const size = Math.min(avatarImg.width, avatarImg.height);
    const sx = (avatarImg.width - size) / 2;
    const sy = (avatarImg.height - size) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(600, 315, 150, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, sx, sy, size, size, 450, 165, 300, 300);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "#2e4f2e";

    ctx.font = "bold 50px Arial";
    ctx.fillText("Chào mừng thành viên mới", 600, 90);

    ctx.font = "40px Arial";
    ctx.fillText(`Bạn là thành viên thứ ${participantIDs.length}`, 600, 150);
    ctx.fillText(`Của nhóm ${threadName}`, 600, 200);

    ctx.font = "bold 45px Arial";
    ctx.fillText(name, 600, 520);

    ctx.font = "30px Arial";
    ctx.fillText(time, 600, 570);

    const pathSave = __dirname + `/cache/welcome_${uid}.png`;
    fs.writeFileSync(pathSave, canvas.toBuffer());

    await api.sendMessage({
      body: `🌱=====[THÀNH VIÊN VÀO NHÓM]=====🌱
Xin chào ${name}
Chào mừng bạn đến với ${threadName} ❤️`,
      mentions: [{
        tag: name,
        id: uid
      }],
      attachment: fs.createReadStream(pathSave)
    }, threadID);

    fs.unlinkSync(pathSave);
  }
};
