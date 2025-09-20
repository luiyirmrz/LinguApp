# Unified Database and Persistence System

## Overview

The Unified Database and Persistence System solves the critical problems identified in the original architecture:

- **Multiple storage systems** (SQLite, AsyncStorage, Firebase) without synchronization
- **Lack of data migration system** for schema updates
- **Data inconsistency** between different services
- **No backup/restore functionality** for user data protection

## Architecture

### Core Components

1. **UnifiedDataService** (`services/unifiedDataService.ts`)
   - Single point of access for all data operations
   - Automatic synchronization across all storage systems
   - Schema versioning and migration support
   - Backup and restore functionality

2. **DataMigrationService** (`services/dataMigrationService.ts`)
   - Handles migration from old storage systems
   - Validates data integrity
   - Provides rollback capabilities

3. **DataMigrationComponent** (`components/DataMigrationComponent.tsx`)
   - User interface for migration operations
   - Progress tracking and error reporting
   - Backup management

## Key Features

### 1. Unified API

**Before (Problem):**
```typescript
// ❌ Multiple storage systems without synchronization
await databaseService.saveUser(user); // SQLite
await AsyncStorage.setItem('user', JSON.stringify(user)); // AsyncStorage
await firestoreService.updateUser(user.id, user); // Firebase
```

**After (Solution):**
```typescript
// ✅ Single unified API
await unifiedDataService.saveUser(user); // Handles all storage systems internally
```

### 2. Automatic Data Synchronization

The system automatically synchronizes data across all storage systems:

- **SQLite**: Primary local database for offline support
- **AsyncStorage**: Fallback storage for simple data
- **Firebase**: Cloud storage for backup and cross-device sync

```typescript
// Data is automatically saved to all systems
await unifiedDataService.saveUser(user);
// → Saves to SQLite
// → Saves to AsyncStorage
// → Saves to Firebase (if online)
// → Queues for sync if offline
```

### 3. Schema Versioning and Migration

The system includes automatic schema migration:

```typescript
// Automatic migration on app startup
private async checkAndMigrateData(): Promise<void> {
  const currentVersion = await this.getCurrentSchemaVersion();
  
  if (currentVersion < CURRENT_SCHEMA_VERSION) {
    console.log(`Migrating data from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`);
    await this.migrateData(currentVersion, CURRENT_SCHEMA_VERSION);
  }
}
```

### 4. Backup and Restore

Complete backup and restore functionality:

```typescript
// Create backup
const backup = await unifiedDataService.createBackup();

// Restore from backup
await unifiedDataService.restoreBackup(backup);
```

### 5. Offline Queue with Conflict Resolution

Operations are queued when offline and synced when connection is restored:

```typescript
// Operations are automatically queued when offline
await unifiedDataService.saveUser(user); // Queued if offline

// Sync when connection is restored
await unifiedDataService.syncData(); // Processes offline queue
```

## Implementation Details

### Storage Hierarchy

1. **SQLite** (Primary)
   - Fast local database
   - Structured data storage
   - Offline-first operations

2. **AsyncStorage** (Fallback)
   - Simple key-value storage
   - Backup for SQLite failures
   - Legacy data migration

3. **Firebase** (Cloud)
   - Cross-device synchronization
   - Backup and recovery
   - Real-time updates

### Data Flow

```
User Action → UnifiedDataService → [SQLite, AsyncStorage, Firebase] → Sync Queue
     ↓
Offline Detection → Queue Operations → Connection Restored → Sync Data
```

### Migration Process

1. **Detection**: Check current schema version
2. **Backup**: Create backup before migration
3. **Migration**: Transform data to new schema
4. **Validation**: Verify data integrity
5. **Cleanup**: Remove old data formats

## Usage Examples

### Basic Data Operations

```typescript
import { unifiedDataService } from '@/services/unifiedDataService';

// Save user data
await unifiedDataService.saveUser(user);

// Get user data
const user = await unifiedDataService.getUser(userId);

// Update user data
await unifiedDataService.updateUser(userId, { points: 100 });

// Save learning progress
await unifiedDataService.saveProgress(userId, progressData);
```

### Migration Operations

```typescript
import { dataMigrationService } from '@/services/dataMigrationService';

// Safe migration with backup and validation
const status = await dataMigrationService.safeMigration();

// Force migration (overwrites existing data)
const status = await dataMigrationService.forceMigration();

// Check migration status
const status = await dataMigrationService.getMigrationStatus();
```

### Backup Operations

```typescript
import { unifiedDataService } from '@/services/unifiedDataService';

// Create backup
const backup = await unifiedDataService.createBackup();

// Get existing backup
const backup = await unifiedDataService.getBackup();

// Restore from backup
await unifiedDataService.restoreBackup(backup);
```

## Migration from Old System

### Automatic Migration

The system automatically detects and migrates data from old storage systems:

1. **AsyncStorage Keys**: `local_user`, `local_progress`, etc.
2. **Old Database Service**: SQLite tables from previous version
3. **Firebase Data**: Existing Firestore collections

### Manual Migration

Use the DataMigrationComponent for manual migration:

```typescript
import DataMigrationComponent from '@/components/DataMigrationComponent';

// In your component
<DataMigrationComponent
  onComplete={() => console.log('Migration complete')}
  onError={(error) => console.error('Migration failed:', error)}
  showAdvancedOptions={true}
/>
```

## Error Handling

### Centralized Error Management

All errors are handled through the centralized error service:

```typescript
private async executeWithErrorHandling<T>(
  operation: () => Promise<T>, 
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await handleError(error as Error, 'data', {
      action: context,
      additionalData: { service: 'unifiedDataService' }
    });
    throw error;
  }
}
```

### Fallback Strategies

1. **SQLite Failure**: Fall back to AsyncStorage
2. **AsyncStorage Failure**: Continue with SQLite only
3. **Firebase Failure**: Queue for later sync
4. **Network Failure**: Operate in offline mode

## Performance Optimizations

### Caching Strategy

- **Memory Cache**: Frequently accessed data
- **SQLite Cache**: Structured data with indexes
- **AsyncStorage Cache**: Simple key-value pairs

### Batch Operations

```typescript
// Batch multiple operations
const batch = writeBatch(db);
batch.set(docRef1, data1);
batch.set(docRef2, data2);
await batch.commit();
```

### Selective Sync

Only sync changed data:

```typescript
// Check if data has changed before syncing
if (localData.lastSync !== remoteData.lastSync) {
  await syncData();
}
```

## Security Considerations

### Data Encryption

- SQLite database encryption (when available)
- AsyncStorage data encryption
- Firebase security rules

### Access Control

- User-specific data isolation
- Role-based access control
- Audit logging for sensitive operations

## Monitoring and Analytics

### Data Size Monitoring

```typescript
const dataSize = await unifiedDataService.getDataSize();
console.log(`SQLite: ${dataSize.sqlite} bytes`);
console.log(`AsyncStorage: ${dataSize.asyncStorage} bytes`);
```

### Sync Status Monitoring

```typescript
const isOnline = await unifiedDataService.isOnline();
const queueLength = await unifiedDataService.getOfflineQueueLength();
```

## Testing

### Unit Tests

```typescript
// Test data operations
describe('UnifiedDataService', () => {
  it('should save user data to all storage systems', async () => {
    const user = createTestUser();
    await unifiedDataService.saveUser(user);
    
    // Verify data in all systems
    expect(await getSQLiteUser(user.id)).toEqual(user);
    expect(await getAsyncStorageUser(user.id)).toEqual(user);
    expect(await getFirebaseUser(user.id)).toEqual(user);
  });
});
```

### Integration Tests

```typescript
// Test migration process
describe('DataMigrationService', () => {
  it('should migrate old data to new format', async () => {
    // Setup old data
    await createOldFormatData();
    
    // Run migration
    const status = await dataMigrationService.safeMigration();
    
    // Verify migration
    expect(status.isComplete).toBe(true);
    expect(status.migratedRecords.users).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check backup availability
   - Verify data integrity
   - Review error logs

2. **Sync Issues**
   - Check network connectivity
   - Verify Firebase configuration
   - Review offline queue

3. **Performance Issues**
   - Monitor data size
   - Check for memory leaks
   - Optimize queries

### Debug Tools

```typescript
// Enable debug logging
console.log('Migration status:', await dataMigrationService.getMigrationStatus());
console.log('Sync queue length:', await unifiedDataService.getOfflineQueueLength());
console.log('Online status:', await unifiedDataService.isOnline());
```

## Future Enhancements

### Planned Features

1. **Incremental Sync**: Only sync changed data
2. **Conflict Resolution**: Advanced merge strategies
3. **Data Compression**: Reduce storage usage
4. **Multi-device Sync**: Real-time synchronization
5. **Data Analytics**: Usage patterns and insights

### Schema Evolution

The system is designed to handle future schema changes:

```typescript
// Future migration example
private async migrateToVersion2(result: MigrationResult): Promise<void> {
  // Add new fields to existing data
  const users = await this.getAllUsers();
  for (const user of users) {
    user.newField = defaultValue;
    await this.saveUser(user);
  }
}
```

## Conclusion

The Unified Database and Persistence System provides a robust, scalable solution for data management in LinguApp. It eliminates the problems of multiple storage systems, provides automatic migration, ensures data consistency, and offers comprehensive backup and restore functionality.

The system is designed to be:
- **Reliable**: Multiple fallback strategies
- **Scalable**: Handles growing data volumes
- **Maintainable**: Clear separation of concerns
- **User-friendly**: Automatic operations with manual controls
- **Future-proof**: Extensible architecture for new features
