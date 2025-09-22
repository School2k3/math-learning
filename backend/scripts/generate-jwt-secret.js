#!/usr/bin/env node

/**
 * Script to generate a secure random JWT secret
 * Run with: node generate-jwt-secret.js
 */

import crypto from 'crypto';

const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

console.log("\n=== JWT Secret Generator ===\n");
console.log("Add this to your .env file:\n");
console.log(`JWT_SECRET="${generateSecret()}"\n`);
console.log("Keep this value secure and don't commit it to version control!\n");