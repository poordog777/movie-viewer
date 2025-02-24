export interface Movie {
  id: number;
  title: string;
  original_title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export interface MovieDetail extends Movie {
  tagline: string;
  runtime: number;
  genres: {
    id: number;
    name: string;
  }[];
  user_votes: Record<string, number>;
}