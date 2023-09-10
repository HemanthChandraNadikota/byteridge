const mongoose = require('mongoose')

const userLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    _ip : {type : String },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date } 
});

userLogSchema.index({ userId: 1 });

const UserLog = mongoose.model('UserLog', userLogSchema);

module.exports = UserLog
