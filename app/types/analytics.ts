export interface MenuAnalytics {
  views: number;
  uniqueVisitors: number;
  popularItems: {
    itemId: string;
    name: string;
    views: number;
  }[];
  viewsByTime: {
    hour: number;
    views: number;
  }[];
  viewsByDay: {
    date: string;
    views: number;
  }[];
}
