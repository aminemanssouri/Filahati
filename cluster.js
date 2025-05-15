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
} catch (error) {
  logger = console;
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

    // Fork workers equal to CPU cores
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
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
          Object.values(cluster.workers).forEach(w => {
            w.send(message.payload);
          });
        }
      });
    });
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
