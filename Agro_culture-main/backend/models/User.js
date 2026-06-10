const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['farmer', 'buyer'], required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, required: true },
  status: {
    active: { type: Boolean, default: false },
    hash: { type: String }
  },
  profile: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, default: 0 },
    picExt: { type: String, default: 'png' },
    picStatus: { type: Number, default: 0 }
  }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
