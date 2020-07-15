#!/usr/bin/env node
import { migrate_database }  from '../lib/database.js';

migrate_database();

console.log("Migration complete");