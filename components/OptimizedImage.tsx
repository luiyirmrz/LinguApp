import React, { memo } from 'react';
import { Image } from 'react-native';

interface OptimizedImageProps {
  source: any;
  style?: any;
}

function OptimizedImage({ source, style }: OptimizedImageProps) {
  return <Image source={source} style={style} />;
}

OptimizedImage.displayName = 'OptimizedImage';

export default memo(OptimizedImage);
