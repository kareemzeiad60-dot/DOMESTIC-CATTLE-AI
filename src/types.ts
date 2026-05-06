export interface CattleAnalysis {
  id: string;
  timestamp: string;
  breed: string;
  confidence: number;
  description: string;
  characteristics: {
    origin: string;
    weightRange: string;
    milkProduction?: string;
    meatQuality?: string;
    hardiness: string;
  };
  imageUrl: string;
  topMatches?: { breed: string, confidence: number }[];
}

export interface SidebarState {
  isOpen: boolean;
}
