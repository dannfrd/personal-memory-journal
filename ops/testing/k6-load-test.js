// ==============================================================================
// k6 Load & Concurrent Performance Test for lovelog.my.id
// Specs Covered: TEST-03, TEST-04, TEST-05, TEST-06
// Target Metrics:
//   - API Response Time (p95) <= 500 ms
//   - HTTP Error 5xx == 0%
// Usage:
//   k6 run ops/testing/k6-load-test.js
//   BASE_URL=https://lovelog.my.id API_URL=http://127.0.0.1:3001 k6 run ops/testing/k6-load-test.js
// ==============================================================================
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate } from "k6/metrics";

const apiLatency = new Trend("lovelog_api_duration_ms", true);
const pageLatency = new Trend("lovelog_page_duration_ms", true);
const error5xxRate = new Rate("lovelog_http_5xx_rate");

export const options = {
  stages: [
    { duration: "20s", target: 15 }, // Ramp up to 15 concurrent users
    { duration: "40s", target: 30 }, // Sustained load at 30 concurrent users on 2 vCPU VPS
    { duration: "20s", target: 0 },  // Graceful ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],          // Spec section 8: p95 <= 500 ms
    lovelog_api_duration_ms: ["p(95)<300"],    // Backend API p95 <= 300 ms
    lovelog_http_5xx_rate: ["rate==0"],        // Spec section 8: 0% HTTP 5xx errors
    http_req_failed: ["rate<0.01"],            // < 1% overall failure
  },
};

const BASE_URL = __ENV.BASE_URL || "https://lovelog.my.id";
const API_URL = __ENV.API_URL || "http://127.0.0.1:3001";
const INTERNAL_SECRET = __ENV.VPS_API_SECRET || "";

export default function () {
  group("1. Frontend Homepage & Static Assets", () => {
    const res = http.get(`${BASE_URL}/`, {
      headers: { "Accept-Encoding": "br, gzip" },
    });

    pageLatency.add(res.timings.duration);
    error5xxRate.add(res.status >= 500);

    check(res, {
      "Homepage status is 200": (r) => r.status === 200,
      "Homepage no 5xx error": (r) => r.status < 500,
    });
  });

  group("2. Backend API Health & Paginated Memories", () => {
    const healthRes = http.get(`${API_URL}/health`);
    apiLatency.add(healthRes.timings.duration);
    error5xxRate.add(healthRes.status >= 500);

    check(healthRes, {
      "Health endpoint is 200": (r) => r.status === 200,
    });

    const headers = {
      "Accept-Encoding": "br, gzip",
      ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
    };

    const listRes = http.get(`${API_URL}/memories?page=1&limit=12`, { headers });
    apiLatency.add(listRes.timings.duration);
    error5xxRate.add(listRes.status >= 500);

    check(listRes, {
      "GET /memories status is 200 or 403 (if secret required)": (r) =>
        r.status === 200 || (!INTERNAL_SECRET && r.status === 403),
      "GET /memories response time < 500ms": (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}
