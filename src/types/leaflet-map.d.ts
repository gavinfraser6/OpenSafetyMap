import { Report } from "@/app/page";

export type LeafletMapRef = {
  refreshReports: () => void;
  clearCacheForBounds: () => void;
};