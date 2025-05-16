// utils/performance-metrics.ts
import type { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  switch (metric.name) {
    case 'FCP':
      console.log('⏱ First Contentful Paint:', metric.value);
      break;
    case 'LCP':
      console.log('📦 Largest Contentful Paint:', metric.value);
      break;
    case 'TTFB':
      console.log('🚀 Time to First Byte:', metric.value);
      break;
    case 'CLS':
      console.log('💥 Cumulative Layout Shift:', metric.value);
      break;
    case 'FID':
      console.log('👆 First Input Delay:', metric.value);
      break;
    default:
      console.log(`${metric.name}:`, metric.value);
  }
}
