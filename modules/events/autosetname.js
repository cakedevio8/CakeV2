module.exports.config = {
  name: "autosetname",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "Cake Country",
  description: "Tự động set biệt danh khi có người vào",
  commandCategory: "Quản Trị",
  usages: "on/off/set [format]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Threads }) {

  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage(
`📌 Hướng dẫn dùng autosetname:

• ${global.config.PREFIX}autosetname on
• ${global.config.PREFIX}autosetname off
• ${global.config.PREFIX}autosetname set [format]

Biến hỗ trợ:
{name}  → Tên đầy đủ
{short} → Tên ngắn
{tv}    → Số thành viên
{time}  → Thời gian`,
      threadID, messageID);
  }

  const data = (await Threads.getData(threadID)).data || {};

  if (args[0] == "on") {
    data.autoSetName = data.autoSetName || {};
    data.autoSetName.status = true;
    await Threads.setData(threadID, { data });
    return api.sendMessage("✅ Đã bật autosetname", threadID, messageID);
  }

  if (args[0] == "off") {
    data.autoSetName = data.autoSetName || {};
    data.autoSetName.status = false;
    await Threads.setData(threadID, { data });
    return api.sendMessage("❌ Đã tắt autosetname", threadID, messageID);
  }

  if (args[0] == "set") {
    const format = args.slice(1).join(" ");
    if (!format) return api.sendMessage("⚠️ Vui lòng nhập format.", threadID, messageID);

    data.autoSetName = data.autoSetName || {};
    data.autoSetName.format = format;
    await Threads.setData(threadID, { data });

    return api.sendMessage("💾 Đã lưu format autosetname", threadID, messageID);
  }
};t name cho thành viên mới...", threadID, event.messageID);
};
