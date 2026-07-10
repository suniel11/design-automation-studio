import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  company: String,
  plan: { type: String, default: 'free', enum: ['free', 'starter', 'professional', 'enterprise'] },
  subscriptionId: String,
  monthlyUsage: { type: Number, default: 0 },
  monthlyLimit: { type: Number, default: 5 },
  apiKey: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.model('User', userSchema);
