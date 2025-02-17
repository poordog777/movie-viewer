export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  overview: string;
  voteAverage: number;
  voteCount: number;
}

export interface MovieDetail extends Movie {
  tagline: string;
  runtime: number;
  genres: {
    id: number;
    name: string;
  }[];
  userRating?: number;
}