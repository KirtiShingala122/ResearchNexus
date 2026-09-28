import PlaceholderPage from "../components/PlaceholderPage";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <PlaceholderPage
      title="Semantic Search"
      description="Find papers using natural language queries powered by sentence-transformer embeddings. Discover semantically similar research beyond simple keyword matching."
      icon={Search}
    />
  );
}
