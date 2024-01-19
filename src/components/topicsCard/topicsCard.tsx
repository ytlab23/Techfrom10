import { Badge } from "@/components/ui/badge";

interface TopicsCardProps {
  uniqueHashtags: string[];
  selectedTags: string[];
  handleTagSelection: (hashtag: string) => void;
}

export const TopicsCard: React.FC<TopicsCardProps> = ({
  uniqueHashtags,
  selectedTags,
  handleTagSelection,
}) => {
  return (
    <div className="hero-card1">
      <h3>Topics</h3>
      <div className="hero-card1-items">
        <Badge
          key="uncategorized"
          onClick={() => handleTagSelection("uncategorized")}
          className={
            selectedTags.includes("uncategorized")
              ? "selected-hashtag"
              : "unselected-hashtag"
          }
        >
          #Others
        </Badge>
        {uniqueHashtags.map((hashtag) => (
          <Badge
            key={`hashtag-${hashtag}`}
            onClick={() => handleTagSelection(hashtag)}
            className={
              selectedTags.includes(hashtag)
                ? "selected-hashtag"
                : "unselected-hashtag"
            }
          >
            #{hashtag}
          </Badge>
        ))}
      </div>
    </div>
  );
};
