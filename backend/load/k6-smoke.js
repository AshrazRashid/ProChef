import http from "k6/http";
import { check, sleep } from "k6";

const base = __ENV.API_BASE_URL || "http://127.0.0.1:4000";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"]
  }
};

export default function () {
  const res = http.get(`${base}/health`);
  check(res, { "health 200": (r) => r.status === 200 });
  sleep(0.05);
}
