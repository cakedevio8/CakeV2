const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const cron = require("node-cron");

const DATA_PATH = path.join(__dirname, "cache", "data", "thuebot.json");
const TIMEZONE = "Asia/Ho_Chi_Minh";

// ====== Load Data ======
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, "[]");
}

let data = JSON.parse(fs.readFileSync(DATA_PATH));

const saveData = () => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
};

const formatDate = (date) => moment(date, "DD/MM/YYYY", true).isValid();

const getRemainingDays = (endDate) => {
  return Math.floor(
    (moment.tz(endDate, "DD/MM/YYYY", TIMEZONE).valueOf() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );
};

// ====== CONFIG ======
module.exports.config = {
  name: "rent",
  version: "2.0.0",
  hasPermssion: 3,
  credits: "Cake Country",
  description: "Quản lý thuê bot",
  commandCategory: "Admin",
  usePrefix: false,
  usages: "add | info | list | del | giahan",
  cooldowns: 3,
};

// ====== MAIN ======
module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  if (!global.config.ADMINBOT.includes(senderID))
    return api.sendMessage("⚠️ Chỉ admin mới dùng được.", threadID);

  const sub = args[0];

  // ================= ADD =================
  if (sub === "add") {
    const endDate = args[1];
    if (!endDate || !formatDate(endDate))
      return api.sendMessage("❎ Ngày không hợp lệ (DD/MM/YYYY)", threadID);

    if (data.find((x) => x.t_id === threadID))
      return api.sendMessage("⚠️ Nhóm đã tồn tại trong danh sách thuê.", threadID);

    const startDate = moment.tz(TIMEZONE).format("DD/MM/YYYY");

    data.push({
      t_id: threadID,
      id: senderID,
      time_start: startDate,
      time_end: endDate,
    });

    saveData();

    const remain = getRemainingDays(endDate);

    await api.changeNickname(
      `⪼ HSD: ${endDate} (${remain} ngày)`,
      threadID,
      api.getCurrentUserID()
    );

    return api.sendMessage("✅ Thêm nhóm thuê thành công.", threadID);
  }

  // ================= INFO =================
  if (sub === "info") {
    const group = data.find((x) => x.t_id === threadID);
    if (!group)
      return api.sendMessage("❎ Nhóm này chưa thuê bot.", threadID);

    const remain = getRemainingDays(group.time_end);

    return api.sendMessage(
      `📌 Thông Tin Thuê Bot\n\n👤 ID: ${group.id}
🗓 Bắt đầu: ${group.time_start}
⌛ Hết hạn: ${group.time_end}
⏳ Còn lại: ${remain} ngày`,
      threadID
    );
  }

  // ================= LIST =================
  if (sub === "list") {
    if (data.length === 0)
      return api.sendMessage("❎ Không có nhóm nào đang thuê.", threadID);

    let msg = "📜 Danh Sách Thuê Bot:\n\n";

    data.forEach((item, index) => {
      const remain = getRemainingDays(item.time_end);
      msg += `${index + 1}. ${item.t_id}\n   HSD: ${item.time_end} (${remain} ngày)\n\n`;
    });

    return api.sendMessage(msg, threadID);
  }

  // ================= DEL =================
  if (sub === "del") {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || !data[index])
      return api.sendMessage("❎ STT không hợp lệ.", threadID);

    data.splice(index, 1);
    saveData();

    return api.sendMessage("✅ Đã xóa nhóm khỏi danh sách thuê.", threadID);
  }

  // ================= GIA HAN =================
  if (sub === "giahan") {
    const index = parseInt(args[1]) - 1;
    const newDate = args[2];

    if (isNaN(index) || !data[index])
      return api.sendMessage("❎ STT không hợp lệ.", threadID);

    if (!formatDate(newDate))
      return api.sendMessage("❎ Ngày không hợp lệ.", threadID);

    data[index].time_start = moment.tz(TIMEZONE).format("DD/MM/YYYY");
    data[index].time_end = newDate;

    saveData();

    const remain = getRemainingDays(newDate);

    await api.changeNickname(
      `⪼ HSD: ${newDate} (${remain} ngày)`,
      data[index].t_id,
      api.getCurrentUserID()
    );

    return api.sendMessage("✅ Gia hạn thành công.", threadID);
  }

  return api.sendMessage(
    "📌 Cách dùng:\n- rent add DD/MM/YYYY\n- rent info\n- rent list\n- rent del STT\n- rent giahan STT DD/MM/YYYY",
    threadID
  );
};

// ====== AUTO UPDATE NICKNAME DAILY ======
cron.schedule("0 0 * * *", async () => {
  for (const group of data) {
    const remain = getRemainingDays(group.time_end);
    if (remain < 0) continue;

    try {
      await global.client.api.changeNickname(
        `⪼ HSD: ${group.time_end} (${remain} ngày)`,
        group.t_id,
        global.client.api.getCurrentUserID()
      );
    } catch (err) {
      console.log("Lỗi update nickname:", err);
    }
  }
});
