const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure an encryption key exists. For production, set ENCRYPTION_KEY in your environment.
// Using a default here makes local development easier but is insecure for production.
const encryptionKey =
  process.env.ENCRYPTION_KEY || 'dev_default_encryption_key_change_me';
userSchema.plugin(encrypt, {
  secret: encryptionKey,
  encryptedFields: ['password'],
});

// Create and export the model after applying plugins
const User = mongoose.model('User', userSchema);

module.exports = User;
