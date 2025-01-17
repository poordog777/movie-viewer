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
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

export default mongoose.model('Movie', movieSchema);