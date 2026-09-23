/**
 * User Database Model & Schema
 * Represents registered application users.
 */

const mongoose = require('mongoose');

// Mongoose Schema Definition (For MongoDB environments)
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password hash is required'],
      minlength: [6, 'Password hash must be valid']
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password; // Never expose password in JSON responses
        return ret;
      }
    }
  }
);

// Fallback Model Class for SQL / In-Memory environments
class UserModel {
  constructor({ id, name, email, password, currency = 'INR', createdAt = new Date().toISOString() }) {
    this.id = id;
    this.name = name;
    this.email = email.toLowerCase().trim();
    this.password = password; // Hashed password
    this.currency = currency;
    this.createdAt = createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      currency: this.currency,
      createdAt: this.createdAt
    };
  }
}

// Export mongoose model if mongoose is available, else fallback class
let User;
try {
  User = mongoose.models.User || mongoose.model('User', UserSchema);
} catch (e) {
  User = UserModel;
}

module.exports = {
  User,
  UserSchema,
  UserModel
};
