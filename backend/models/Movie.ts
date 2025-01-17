import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  originalTitle: { type: String },
  description: { type: String },
  releaseDate: { type: Date },
  posterPath: { type: String },
  backdropPath: { type: String },
  voteAverage: { type: Number },
  voteCount: { type: Number },
  ratings: [{ type: Number, ref: 'Rating' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Movie', movieSchema);