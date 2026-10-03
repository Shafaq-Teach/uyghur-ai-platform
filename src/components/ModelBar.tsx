'use client';

import React from 'react';
import { FeatureModels } from '@/types';

interface Props {
  feature: keyof FeatureModels;
  featureTitle?: string;
}

export const ModelBar: React.FC<Props> = () => {
  return null;
};
