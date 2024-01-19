import Message from '../models/messageModel.js';
import user from '../models/userModel.js';
import Chat from '../models/chatModel.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
import mongoose from 'mongoose'
import { timeStamp } from 'console';
export const sendMessage = async (req, res) => {
  const { chatId, message,messageType } = req.body;
  try {
    let msg = await Message.create({ sender: req.rootUserId, message, chatId,messageType });
    msg = await (
      await msg.populate('sender', 'name profilePic email')
    ).populate({
      path: 'chatId',
      select: 'chatName isGroup users',
      model: 'Chat',
      populate: {
        path: 'users',
        select: 'name email profilePic',
        model: 'User',
      },
    });
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: msg,
    });
    res.status(200).send(msg);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};

export const addMedia = async (req, res) => {
  try {
    let mediaUrl = `${process.env.SERVER_BASE_URL}api/message/media/download/${req.file.filename}/${req.file.mimetype}`
    let contentType = "";
    for(let i=0;i<req.file.mimetype.length;i++){
      if(req.file.mimetype[i]==='/'){
        contentType = req.file.mimetype.slice(0,i)
      }
    }
    if (req.file.path) res.status(200).json({
      mediaUrl,
      contentType
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

export const getMedia = async (req, res) => {
  try {
    const { fileName, contentType, fileType } = req.params;
    const __filename = fileURLToPath(import.meta.url);
    let __dirname = dirname(__filename);
    __dirname = __dirname.slice(0, __dirname.length - 11)
    let filePath = path.join(__dirname, `/uploads/media/${fileName}`)
    fs.readFile(filePath, function (err, data) {
      if (err) throw err; // Fail if the file can't be read.
      res.writeHead(200, { 'Content-Type': `${contentType}/${fileType}` });
      res.end(data); // Send the file data to the browser.
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error });
  }
}
// export const getMessages = async (req, res) => {
//   const { chatId } = req.params;
//   try {
//     let messages = await Message.find({ chatId })
//       .populate({
//         path: 'sender',
//         model: 'User',
//         select: 'name profilePic email',
//       })
//       .populate({
//         path: 'chatId',
//         model: 'Chat',
//       });
//      console.log(messages)
//     res.status(200).json(messages);
//   } catch (error) {
//     res.sendStatus(500).json({ error: error });
//     console.log(error);
//   }
// };

export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  // const { page = 1, pageSize = 10 } = req.query;
  let page = 1, pageSize = 10;

  try {
    const pipeline = [
      { $match: { chatId: mongoose.Types.ObjectId(chatId) } },
      {
        $lookup: {
          from: 'users', // Replace with the actual name of your User model collection
          localField: 'sender',
          foreignField: '_id',
          as: 'senderInfo',
        },
      },
      {
        $lookup: {
          from: 'chats', // Replace with the actual name of your Chat model collection
          localField: 'chatId',
          foreignField: '_id',
          as: 'chatInfo',
        },
      },
      { $unwind: '$senderInfo' },
      { $unwind: '$chatInfo' },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: parseInt(pageSize) },
      {
        $project: {
          _id: 1,
          index:-1,
          text: 1,
          createdAt: 1,
          sender: {
            _id:"$senderInfo._id",
            name: '$senderInfo.name',
            profilePic: '$senderInfo.profilePic',
            email: '$senderInfo.email',
          },
          chatId: '$chatInfo',
          message:"$message",
          messageType:"$messageType"
        },
      },
    ];

    const messages = await Message.aggregate(pipeline);
    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};
