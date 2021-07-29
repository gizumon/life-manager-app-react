// import { NextApiRequest, NextApiResponse } from "next";

// const config = {
//   channelAccessToken: process.env.ACCESS_TOKEN || process.line.channelAccessToken,
//   channelSecret: process.env.SECRET_KEY || conf.line.channelSecret
// };

// export default (req: NextApiRequest, res: NextApiResponse) => {
//   console.log('REQ:', req.body);
//   res.statusCode = 200;
//   res.json({ name: 'John Doe' });

// }

// const Chatbot = require('../chatbot/chatbot');
// const chatbot = new Chatbot();
// const conf = require('config');
// const _ = require('underscore');

// const express = require('express');
// const router = express.Router();

// const config = {
//   channelAccessToken: process.env.ACCESS_TOKEN || conf.line.channelAccessToken,
//   channelSecret: process.env.SECRET_KEY || conf.line.channelSecret
// };

// const line = require('@line/bot-sdk');
// const client = new line.Client(config);

// const maxLength = 2000;

// /* GET home page. */
// console.log(config);
// // router.post('/', line.middleware(config), (req, res) => {
// router.post('/', (req, res) => {
//   console.log(req.body.events);
//   req.body.events.forEach(event => {
//     handleEvent(event).then((result) => {
//       console.log(result);
//       res.json(result)
//     })
//     .catch((err) => {
//        console.log(`ERROR: ${err.status} ${err.message}`);
//        res.json(err);
//     });
//   });
// });

// async function handleEvent(event) {
//   if (event.type !== 'message' || event.message.type !== 'text') {
//     return Promise.resolve(null);
//   }
//   let reply;
//   let message = event.message.text;
//   let result = await chatbot.functions(message);
//   console.log('INFO: Get reply from chatbot functions', reply);

//   if (!_.isEmpty(result)) {
//     // リストの場合、最初のもののみ表示
//     reply = _.isArray(result) ? result[0] : result;
//   } else if(chatbot.has(message)) {
//     reply = chatbot.getReply(message);
//   } else {
//     reply = 'はて？？👴 へるぷと言ってくれれば、わしができることを教えるんじゃ。';
//   }

//   console.log('send message: ', reply.length, reply);
  
//   // 最大文字数以上の場合、最大文字ずつで区切ってプッシュメッセージ
//   while (reply.length - maxLength > 0) {
//     console.log(event.source.userId);
//     const endIndex = reply.slice(0, maxLength).lastIndexOf('\n') + 1;
//     await client.pushMessage(event.source.userId, {
//       type: 'text',
//       text: reply.slice(0, endIndex),
//     });
//     reply = reply.slice(endIndex);
//   }

//   return client.replyMessage(event.replyToken, {
//     type: 'text',
//     text: reply
//   });
// }