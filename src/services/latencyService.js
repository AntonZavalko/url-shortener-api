function simulateDbLatency(operationType = 'read') {
  const delay = operationType === 'read' ? 50 : 100;
  return new Promise(resolve => setTimeout(resolve, delay));
}

module.exports = { simulateDbLatency };
