// Mock SQLite implementation for development
// This provides a fallback when WASM files can't be loaded

export class MockSQLiteDatabase {
  private data: Map<string, any> = new Map();

  constructor(databaseName: string) {
    console.log(`[DEV] Using mock SQLite database: ${databaseName}`);
  }

  async execAsync(query: string, params?: any[]): Promise<any> {
    console.log(`[DEV] Mock SQL Query: ${query}`, params);
    
    // Mock responses for common queries
    if (query.includes('CREATE TABLE')) {
      return { changes: 0, insertId: undefined, rows: [] };
    }
    
    if (query.includes('INSERT')) {
      const insertId = Math.floor(Math.random() * 1000);
      return { changes: 1, insertId, rows: [] };
    }
    
    if (query.includes('SELECT')) {
      return { 
        changes: 0, 
        insertId: undefined, 
        rows: [] 
      };
    }
    
    if (query.includes('UPDATE') || query.includes('DELETE')) {
      return { changes: 1, insertId: undefined, rows: [] };
    }
    
    return { changes: 0, insertId: undefined, rows: [] };
  }

  async closeAsync(): Promise<void> {
    console.log('[DEV] Mock SQLite database closed');
  }
}

export const openDatabaseAsync = async (databaseName: string): Promise<MockSQLiteDatabase> => {
  return new MockSQLiteDatabase(databaseName);
};

export default {
  openDatabaseAsync,
  MockSQLiteDatabase,
};
