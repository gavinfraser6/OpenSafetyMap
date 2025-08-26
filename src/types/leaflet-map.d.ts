export type LeafletMapRef = {
  refreshReports: () => void;
  clearCacheForBounds: () => void;
  navigateToLocation: (latitude: number, longitude: number) => void;
  removePlacedMarker: () => void;
};