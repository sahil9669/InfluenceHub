import mongoose from 'mongoose';
import { Collaboration } from '../models/Collaboration.js';
import { Message } from '../models/Message.js';

const getParticipantCollaboration = async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) {
    response.status(404).json({ error: 'Conversation not found.' });
    return null;
  }

  const collaboration = await Collaboration.findById(request.params.id);
  const userId = String(request.user._id);
  if (!collaboration || ![String(collaboration.brand), String(collaboration.creator)].includes(userId)) {
    response.status(404).json({ error: 'Conversation not found.' });
    return null;
  }
  return collaboration;
};

const toPublicMessage = (message) => ({
  id: String(message._id),
  content: message.content,
  createdAt: message.createdAt,
  sender: message.sender ? { id: String(message.sender._id), name: message.sender.name } : null,
});

export const listMessages = async (request, response) => {
  const collaboration = await getParticipantCollaboration(request, response);
  if (!collaboration) return;
  const messages = await Message.find({ collaboration: collaboration._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('sender', 'name')
    .lean();
  return response.json({ messages: messages.reverse().map(toPublicMessage) });
};

export const createMessage = async (request, response) => {
  const collaboration = await getParticipantCollaboration(request, response);
  if (!collaboration) return;
  if (collaboration.status !== 'In progress') {
    return response.status(409).json({ error: 'This collaboration is not accepting new messages.' });
  }

  const { content } = request.body ?? {};
  if (typeof content !== 'string' || !content.trim() || content.trim().length > 2000) {
    return response.status(400).json({ error: 'Enter a message between 1 and 2000 characters.' });
  }

  const message = await Message.create({
    collaboration: collaboration._id,
    sender: request.user._id,
    content: content.trim(),
  });
  await message.populate('sender', 'name');
  return response.status(201).json({ message: toPublicMessage(message) });
};
