import PlaceholderPage from "../components/PlaceholderPage";
import { FileText } from "lucide-react";

export default function PapersPage() {
  return (
    <PlaceholderPage
      title="Papers"
      description="Browse, search, and filter collected scientific papers from OpenAlex. This module will display paper metadata, abstracts, citation counts, and allow full-text search."
      icon={FileText}
    />
  );
}
