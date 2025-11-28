let totalRequests = 0;
let totalDurationMs = 0;
let activeConnections = 0;
let errorCount = 0;
const startTime = Date.now();

function beforeRequest() {
  totalRequests++;
  activeConnections++;
}

function afterRequest(durationMs) {
  totalDurationMs += durationMs;
  activeConnections = Math.max(activeConnections - 1, 0);
}

function registerError() {
  errorCount++;
}

function getMetrics() {
  const uptimeSeconds = (Date.now() - startTime) / 1000;
  const avgResponseTime = totalRequests
    ? totalDurationMs / totalRequests
    : 0;
  const rps = uptimeSeconds ? totalRequests / uptimeSeconds : 0;
  const errorRate = totalRequests ? errorCount / totalRequests : 0;

  return {
    total_requests: totalRequests,
    requests_per_second: rps,
    average_response_time_ms: avgResponseTime,
    active_connections: activeConnections,
    error_rate: errorRate,
    uptime_seconds: uptimeSeconds
  };
}

module.exports = {
  beforeRequest,
  afterRequest,
  registerError,
  getMetrics
};
