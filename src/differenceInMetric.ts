import type { MetricDiff } from './compareCoverage';

const differenceInMetric = (currentAndIncoming: MetricDiff): number => (
    currentAndIncoming.incoming - currentAndIncoming.current
);

export default differenceInMetric;
