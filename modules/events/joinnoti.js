module.exports.config = {
	name: "joinnoti",
	eventType: ["log:subscribe"],
	version: "1.0.1",
	credits: "Cake",
	description: "Thông báo bot hoặc người vào nhóm + shareContact",
	dependencies: {
		"fs-extra": "",
		"path": "",
		"pidusage": ""
	}
};
let _0 = x=>x<10?'0'+x:x;
let time_str = time=>(d=>`${_0(d.getHours())}:${_0(d.getMinutes())}:${_0(d.getSeconds())} - ${_0(d.getDate())}/${_0(d.getMonth()+1)}/${d.getFullYear()} (Thứ ${d.getDay()==0?'Chủ Nhật':d.getDay()+1})`)(new Date(time));
module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

	const path = join(__dirname, "cache", "joinGif");
	if (existsSync(path)) mkdirSync(path, { recursive: true });	

	const path2 = join(__dirname, "cache", "joinGif", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });

    return;
}


module.exports.run = async function({ api, event, Users  , Threads}) {
    
	const { join } = global.nodemodule["path"];
	const { threadID } = event;
  ////////////////////////////////////////////////////////
  const thread = global.data.threadData.get(threadID) || {};
  if (typeof thread["joinNoti"] != "undefined" && thread["joinNoti"] == false) return;
  ///////////////////////////////////////////////////////
	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		api.changeNickname(`⟬ ${global.config.PREFIX} ⟭ ➣ ${(!global.config.BOTNAME) ? "Made by cake" : global.config.BOTNAME}`, threadID, api.getCurrentUserID());
		const fs = require("fs");
    var mlg="⚜️═════[ Đã kết nối thành công ]══════⚜️\nHãy liên hệ với admin để thuê bot nha❤️\nDùng lệnh "callad" để liên hệ với admin\nFaceBook của admin:\nhttps://www.facebook.com/share/1Fv6QGTynR/"
    	return api.sendMessage(threadID,async () => {
await api.shareContact(`${mlg}`,61561101096216, threadID);
});

	}
	else {
		try {
    const { threadName, participantIDs } = await api.getThreadInfo(threadID);
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");

    for (let user of event.logMessageData.addedParticipants) {

      const name = user.fullName;
      const uid = user.userFbId;

      const canvas = Canvas.createCanvas(1200, 630);
      const ctx = canvas.getContext("2d");

      // ===== LOAD BACKGROUND =====
      const background = await Canvas.loadImage(__dirname + "/cache/background.png");
      ctx.drawImage(background, 0, 0, 1200, 630);

      // ===== LOAD AVATAR =====
      const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
      const avatar = await axios.get(avatarURL, { responseType: "arraybuffer" });
      const avatarImg = await Canvas.loadImage(Buffer.from(avatar.data, "binary"));

      // ===== VẼ AVATAR TRÒN (đúng khung giữa ảnh m gửi) =====
      ctx.save();
      ctx.beginPath();
      ctx.arc(600, 315, 150, 0, Math.PI * 2, true); // chính giữa
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, 450, 165, 300, 300);
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = "#2e4f2e";

      // ===== CHỮ PHÍA TRÊN =====
      ctx.font = "bold 50px Arial";
      ctx.fillText("Chào mừng thành viên mới", 600, 90);

      ctx.font = "40px Arial";
      ctx.fillText(`Bạn là thành viên thứ ${participantIDs.length}`, 600, 150);

      ctx.fillText(`Của nhóm ${threadName}`, 600, 200);

      // ===== CHỮ PHÍA DƯỚI =====
      ctx.font = "bold 45px Arial";
      ctx.fillText(name, 600, 520);

      ctx.font = "30px Arial";
      ctx.fillText(time, 600, 570);

      // ===== LƯU & GỬI =====
      const pathSave = __dirname + `/cache/welcome_${uid}.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer())pwait api.sendMessage({
  body: `🌱=====[THÀNH VIÊN VÀO NHÓM]=====🌱\nXin chào, bạn được thêm vào nhóm ${threadName}\nChúc bạn 1 ngày vui vẻ nhé❤️`,
  mentions: [{
    tag: name,
    id: uid
  }],
  attachment: fs.createReadStream(pathSave)
}, threadID);
