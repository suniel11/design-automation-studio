import mongoose from 'mongoose';

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  brandName: String,
  primaryColor: String,
  secondaryColor: String,
  brandTone: String,
  campaignType: String,
  headline: String,
  subheadline: String,
  cta: String,
  formats: [String],
  concepts: [{
    format: String,
    headline: String,
    subheadline: String,
    bodyCopy: String,
  }],
  canvaDesigns: [{
    format: String,
    designId: String,
    editUrl: String,
    viewUrl: String,
  }],
  exports: [{
    format: String,
    url: String,
    createdAt: Date,
  }],
  status: { type: String, enum: ['generating', 'ready', 'exported', 'error'], default: 'generating' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Design = mongoose.model('Design', designSchema);
