import React from 'react';
import { View, Text } from 'react-native';

// Main Offline Mode Component
const OfflineMode: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Offline Mode Component</Text>
    </View>
  );
};

OfflineMode.displayName = 'OfflineMode';

export default OfflineMode;
