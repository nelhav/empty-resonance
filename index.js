const http = require("http");
const querystring = require("querystring");
const {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  Collection,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, //サーバーの取得
    GatewayIntentBits.MessageContent, //メッセージ内容の取得
    GatewayIntentBits.GuildMessages,
  ], //サーバー内メッセージの取得
  partials: [Partials.Channel],
}); //DMの取得

http
  .createServer(function (req, res) {
    if (req.method == "POST") {
      var data = "";
      req.on("data", function (chunk) {
        data += chunk;
      });
      req.on("end", function () {
        if (!data) {
          console.log("No post data");
          res.end();
          return;
        }
        var dataObject = querystring.parse(data);
        console.log("post:" + dataObject.type);
        if (dataObject.type == "wake") {
          console.log("Woke up in post");
          res.end();
          return;
        }
        if (dataObject.type == "finish") {
          console.log("kannkodori:" + dataObject.type);
          if (dataObject.howtoSend == "DM") {
            let userId = dataObject.userID;
            let text = dataObject.comment;
            sendDm(userId, text);
            res.end();
            return;
          }
          if (dataObject.howtoSend == "CHANNEL") {
            let channelId = dataObject.userID;
            let text = dataObject.comment;
            sendMsg(channelId, text);
            res.end();
            return;
          }
          return;
        }
        res.end();
      });
    } else if (req.method == "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write("Discord Bot is active now\n");
      res.end();
    }
  })
  .listen(3000);

client.once(Events.ClientReady, (c) => {
  console.log("Bot準備完了～");
  client.user.setPresence({ activities: [{ name: "時報" }] });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.id == client.user.id) {
    return;
  }
  if (message.mentions.has(client.user)) {
    sendReply(
      message.channel.id,
      "<@" + message.author + ">さん、" + "こんばんは～" + "\n"
    );
    return;
  }
  if (message.content.match(/かんこ～|かんこどり～|かんこー/)) {
    let text = "カンコーッ";
    sendMsg(message.channel.id, text);
    return;
  }
  if (message.content.match(/にゃにゃ/)) {
    let userId = message.author.id;
    let text = "にゃにゃにゃ";
    sendDm(userId, text);
    return;
  }
});

if (process.env.OPERAS == undefined) {
  console.log("OPERASが設定されていません。");
  process.exit(0);
}

client.login(process.env.OPERAS);

function sendReply(channelId, text, option = {}) {
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("リプライ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendMsg(channelId, text, option = {}) {
  client.channels.cache
    .get(channelId)
    .send(text, option)
    .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
    .catch(console.error);
}

function sendMsgPassive(channelId, text, option = {}) {
  client.channels
    .fetch(channelId)
    .then((e) => {
      e.send(text, option)
        .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
        .catch(console.error);
    })
    .catch(console.error);
}

function sendDm(userId, text, option = {}) {
  client.users
    .fetch(userId)
    .then((e) => {
      e.send(text, option)
        .then(console.log("メッセージ送信: " + text + JSON.stringify(option)))
        .catch(console.error); // 1段階目のエラー出力
    })
    .catch(console.error); // 2段階目のエラー出力
}
