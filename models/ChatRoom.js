const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now()
  },
  participants: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    required: true
  },
  messages: [{
    messageBody: {
      type: String,
      required: true
    },
    messageDate: {
      type: Date,
      default: Date.now()
    },
    messageUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  }],
});

module.exports = mongoose.model('ChatRoom', ChatSchema);