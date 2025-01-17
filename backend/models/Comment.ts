import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  userId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', commentSchema);