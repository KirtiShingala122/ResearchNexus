import PlaceholderPage from "../components/PlaceholderPage";
import { Tags } from "lucide-react";

export default function TopicsPage() {
  return (
    <PlaceholderPage
      title="Topics"
      description="Discover research topics through keyword co-occurrence analysis and topic modeling (LDA/BERTopic). Visualize how research themes evolve over time."
      icon={Tags}
    />
  );
}
