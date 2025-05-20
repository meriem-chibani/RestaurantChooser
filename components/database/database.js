import * as SQLite from 'expo-sqlite';

// Database instance with initialization flag
let db;
let isInitialized = false;

// Initialize the database
const initDatabase = () => {
  try {
    if (isInitialized) return db;

    // Open database connection
    db = SQLite.openDatabase('FoodJournal.db');  // No need for async here

    // Create tables
    db.transaction((tx) => {
      tx.executeSql('PRAGMA journal_mode = WAL'); // Setting journal mode for WAL

      // Create tables if not exists
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          email TEXT UNIQUE, 
          password TEXT
        );`
      );

      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          userId INTEGER, 
          image TEXT, 
          description TEXT, 
          date TEXT, 
          category TEXT, 
          FOREIGN KEY(userId) REFERENCES users(id)
        );`
      );
    });

    isInitialized = true;
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Execute SQL queries with automatic initialization
const executeSql = (query, params = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!isInitialized) {
        initDatabase(); // Initialize the DB if not already initialized
      }

      db.transaction((tx) => {
        tx.executeSql(query, params, (_, result) => {
          resolve(result);  // Return the result of the query
        }, (_, error) => {
          reject(error);  // Reject on error
        });
      });
    } catch (error) {
      console.error('SQL execution error:', error);
      reject(error);  // Reject the promise on error
    }
  });
};

export { initDatabase, executeSql };