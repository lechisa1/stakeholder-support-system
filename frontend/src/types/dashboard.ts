export interface DataCardItem {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
  viewLabel?: string;
  status?: "positive" | "negative" | "neutral";
}
