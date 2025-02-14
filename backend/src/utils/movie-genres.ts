// TMDB API 電影類型對照表
export const MOVIE_GENRES: { [key: number]: string } = {
  28: '動作',
  12: '冒險',
  16: '動畫',
  35: '喜劇',
  80: '犯罪',
  99: '紀錄',
  18: '劇情',
  10751: '家庭',
  14: '奇幻',
  36: '歷史',
  27: '恐怖',
  10402: '音樂',
  9648: '懸疑',
  10749: '愛情',
  878: '科幻',
  10770: '電視電影',
  53: '驚悚',
  10752: '戰爭',
  37: '西部'
};

/**
 * 將電影類型ID轉換為中文名稱
 * @param ids 電影類型ID陣列
 * @returns 中文類型名稱陣列
 */
export function getGenreNames(ids: number[]): string[] {
  return ids.map(id => MOVIE_GENRES[id] || '未知類型');
}