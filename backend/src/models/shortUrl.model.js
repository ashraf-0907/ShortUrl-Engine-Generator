import mongoose, { Schema } from "mongoose";

const shortUrl = new Schema({
  user_pno: {
    type: String,
    required: true,
    trim: true,
  },
  global_url: {
    type: String,
    required: true,
    trim: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  time: {
    type: [Date],
    default: [],
  },
});

shortUrl.index({ user_pno: 1 });
shortUrl.index({ global_url: 1 });

export const ShortUrl = mongoose.model("shortUrl", shortUrl);
