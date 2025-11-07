import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 階段性測試,避免瞬間大量請求
  stages: [
    { duration: '30s', target: 10 },  // 30秒內逐漸增加到10個用戶
    { duration: '1m', target: 10 },   // 維持10個用戶1分鐘
    { duration: '30s', target: 20 },  // 增加到20個用戶測試壓力
    { duration: '30s', target: 0 },   // 逐漸降到0
  ],
  
  // 性能指標門檻
  thresholds: {
    http_req_duration: ['p(95)<2000'],      // 95%的請求要在2秒內完成
    http_req_failed: ['rate<0.3'],          // 失敗率要低於30% (考慮Rate Limit)
    'checks{check:狀態碼是 200}': ['rate>0.7'], // 70%以上請求要成功
  },
};

export default function() {
  const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
  const searchQuery = encodeURIComponent('復仇者聯盟');
  const url = `${BASE_URL}/api/v1/movies/search?query=${searchQuery}`;
  
  const response = http.get(url, {
    tags: { name: 'SearchMovies' }, // 為請求加上標籤,方便分析
  });
  
// 詳細的檢查項目
  check(response, {
    '狀態碼是 200': (r) => r.status === 200,
    '未觸發 Rate Limit (429)': (r) => r.status !== 429,
    '未觸發 API Rate Limit (503)': (r) => r.status !== 503,
    '響應時間 < 2s': (r) => r.timings.duration < 2000,
    '響應時間 < 1s': (r) => r.timings.duration < 1000,
    '返回結果不為空': (r) => {
      if (r.status !== 200) return false;
      try {
        const body = r.json();
        return body.success && 
               body.data && 
               body.data.results && 
               body.data.results.length > 0;
      } catch (e) {
        console.error(`JSON 解析錯誤: ${e.message}`);
        return false;
      }
    },
  });
  
  // 只記錄真正失敗的請求 (非 200 狀態碼)
  if (response.status !== 200) {
    console.log(`請求失敗 - 狀態碼: ${response.status}, 訊息: ${response.body.substring(0, 100)}`);
  }
  
  // 根據響應狀態調整休息時間
  if (response.status === 429) {
    sleep(10); // 如果被限流,休息更久
  } else {
    sleep(1); // 正常情況休息1秒
  }
}

// 測試完成後的摘要
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// 簡單的文字摘要函數
function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const enableColors = options.enableColors !== false;
  
  let summary = '\n';
  summary += `${indent}測試摘要報告\n`;
  summary += `${indent}${'='.repeat(50)}\n\n`;
  
  // 基本統計
  const metrics = data.metrics;
  summary += `${indent}總請求數: ${metrics.http_reqs.values.count}\n`;
  summary += `${indent}成功率: ${((1 - metrics.http_req_failed.values.rate) * 100).toFixed(2)}%\n`;
  summary += `${indent}平均響應時間: ${metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}P95 響應時間: ${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  
  // 檢查結果
  if (metrics.checks) {
    summary += `\n${indent}檢查通過率: ${(metrics.checks.values.rate * 100).toFixed(2)}%\n`;
  }
  
  summary += `\n${indent}${'='.repeat(50)}\n`;
  
  return summary;
}