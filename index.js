console.log("load wx-sub");

// 获取画布上下文对象
const canvas = wx.getSharedCanvas();
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = !0;
ctx.imageSmoothingQuality = "high";

// 每个选项偏移量
const offsetInfos = [{ x: 0, y: -8 }, { x: 270, y: -8 }, { x: 0, y: 360 }, { x: 270, y: 360 },];
// 头像对象缓存
const avatars = {};

// 统一子域日志格式，方便过滤
const log = (param1, param2, param3, param4, param5)=>{
  return console.log('wx-sub:', param1, param2, param3, param4, param5);
};

// 加载图片
const loadImage = (url, callback)=>{
  // 读取缓存对象
  var img = avatars[url];
  if (img) {
    callback(img);
  } else {
    // 加载图片
    const img = wx.createImage();
    img.src = url;
    img.onload = () => { 
      // 缓存图片对象
      avatars[url] = img;
      callback(img); 
    };
  }
};

// 绘制一个选项
const drawItem = (info, offset)=>{
  // 计算头像位置
  var avatarPos = { x: offset.x + 57, y: offset.y + 295};

  // 渲染昵称
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.baseLine = "middle";
  ctx.font = "20px Arial";
  // 20px Arial
  // 20px Helvetica
  let nick = info.nickname.length <= 6 ? info.nickname : info.nickname.substr(0, 6) + "...";
  ctx.fillText(nick, avatarPos.x + 70, avatarPos.y + 35);

  // 加载并渲染头像
  loadImage(info.avatarUrl, (img)=>{
    ctx.drawImage(img, avatarPos.x, avatarPos.y, 60, 60);
  });
};

// 绘制
const drawItems = (list)=>{
  list.map((info, i) => { i < 4 && drawItem(info, offsetInfos[i]);});
};

// 获取好友信息
const getFriendInfo = ()=>{
  wx.getPotentialFriendList({
    success: (res) => {
      log('getFriendInfo:', res.list);
      ctx.clearRect(0, 0, 800, 800);
      drawItems(res.list);
    },
    fail: (err) => {
      log("wx.getFriendCloudStorage fail", err);
    }
  })
};

// 监听主域信息
var coolTime = 0;
wx.onMessage((res) => {
  const time = (new Date()).getTime();
  if (time - coolTime < 1000) {
    return;
  }
  coolTime = time;
  if (res.action = "FRIEND_RECOMMENDED") {
    getFriendInfo();
  }

});

// 延迟执行，保证子域环境初始化
setTimeout(getFriendInfo, 1000);