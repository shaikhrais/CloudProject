const express = require('express');
const path = require('path');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Set the view engine to ejs
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Create a Counter metric
const httpRequestCounter = new promClient.Counter({
  name: 'http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Register the metric
register.registerMetric(httpRequestCounter);

// Add default metrics to the register
promClient.collectDefaultMetrics({ register });

// Middleware to increment the counter for each request
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.url,
      status_code: res.statusCode
    });
  });
  next();
});

// Expose the metrics at /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Define a route
app.get('/', (req, res) => {
  res.render('home');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
