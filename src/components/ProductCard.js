import React from 'react';

import LevelBadge from './LevelBadge';
import ListItemCard from './ListItemCard';

export default function ProductCard({
  name,
  subtitle,
  level,
  onPress,
}) {
  return (
    <ListItemCard
      left={<LevelBadge level={level} />}
      title={name}
      subtitle={subtitle}
      onPress={onPress}
    />
  );
}
