import React from 'react';
import { View, Text } from 'react-native';

// Main Export Data Component
const ExportData: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Export Data Component</Text>
    </View>
  );
};

ExportData.displayName = 'ExportData';

export default ExportData;
