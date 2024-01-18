import Message from '../models/messageModel.js';
import user from '../models/userModel.js';
import Chat from '../models/chatModel.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'
export const sendMessage = async (req, res) => {
  const { chatId, message } = req.body;
  try {
    let msg = await Message.create({ sender: req.rootUserId, message, chatId });
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
    if (req.file.path) res.status(200).json({
      mediaUrl
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
export const getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    let messages = await Message.find({ chatId })
      .populate({
        path: 'sender',
        model: 'User',
        select: 'name profilePic email',
      })
      .populate({
        path: 'chatId',
        model: 'Chat',
      });

    res.status(200).json(messages);
  } catch (error) {
    res.sendStatus(500).json({ error: error });
    console.log(error);
  }
};