/**
 * Cluster setup for Filahati API
 * This file creates worker processes based on CPU cores
 * to improve application performance and reliability
 */

const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;
const process = require('process');

// Import the logger if available, otherwise use console
let logger;
try {
  logger = require('./services/loggerService');
  // Successfully loaded logger
} catch (error) {
  // If logger not available, create a simple console wrapper
  logger = {
    info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
    warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
    error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || ''),
    debug: (msg, meta) => console.debug(`[DEBUG] ${msg}`, meta || '')
  };
}

/**
 * Setup clustering for the application
 * @returns {void}
 */
function setupCluster() {
  if (cluster.isPrimary) {
    // This is the primary process
    logger.info(`Primary ${process.pid} is running`);
    logger.info(`Setting up ${numCPUs} workers...`);

    // Create a worker for each CPU
    for (let i = 0; i < numCPUs; i++) {
      // Pass worker ID as environment variable for port calculation
      cluster.fork({
        WORKER_ID: i + 1 // Worker IDs start at 1
      });
    }

    // Log when a worker exits and create a replacement
    cluster.on('exit', (worker, code, signal) => {
      logger.warn(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
      logger.info('Starting a new worker...');
      cluster.fork();
    });

    // Handle messages from workers
    Object.values(cluster.workers).forEach(worker => {
      worker.on('message', message => {
        // If the message needs to be broadcast to all workers
        if (message.type === 'broadcast') {
          logger.debug(`Primary received broadcast message from worker ${worker.process.pid}`, {
            messageType: message.payload?.type || 'unknown'
          });
          
          Object.values(cluster.workers).forEach(w => {
            // Don't send back to the originating worker
            if (w.id !== worker.id) {
              w.send(message.payload);
            }
          });
        }
      });
    });
    
    // Log active workers periodically
    setInterval(() => {
      const activeWorkers = Object.values(cluster.workers).length;
      logger.info(`Cluster status: ${activeWorkers} active workers`, {
        expectedWorkers: numCPUs,
        workerPids: Object.values(cluster.workers).map(w => w.process.pid)
      });
    }, 60000); // Log every minute
  } else {
    // This is a worker process - start the server
    logger.info(`Worker ${process.pid} started`);
    require('./server');
  }
}

// Export the setup function
module.exports = setupCluster;

// If this file is run directly, start the cluster
if (require.main === module) {
  setupCluster();
}
