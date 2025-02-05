/**
 * 電影列表請求參數
 */
export interface MovieListParams {
  page?: number; // 頁碼，默認為1
}

/**
 * 電影詳情請求參數
 */
export interface MovieDetailsParams {
  id: number; // 電影ID
}

/**
 * 電影搜索請求參數
 */
export interface SearchMoviesParams extends MovieListParams {
  query: string; // 搜索關鍵詞
}