import React from 'react';
import { useCelebration } from '../../hooks/useCelebration';
import CelebrationEffect from '../atoms/CelebrationEffect';

const CelebrationContainer: React.FC = () => {
  const { activeEffects } = useCelebration();

  if (activeEffects.length === 0) {
    return null;
  }

  return (
    <div className="celebration-container fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {activeEffects.map((effect) => (
        <CelebrationEffect
          key={effect.id}
          id={effect.id}
          type={effect.type}
          duration={effect.duration}
          intensity={effect.intensity}
          position={effect.position}
          color={effect.color}
        />
      ))}
    </div>
  );
};

export default CelebrationContainer;