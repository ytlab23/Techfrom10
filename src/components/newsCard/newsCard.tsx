import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import { removeAsterisks } from "@/helper/slugFormat";
import { DataProps } from "@/types";

interface NewsCardProps {
  data: DataProps[];
}

export const NewsCard: React.FC<NewsCardProps> = ({ data }) => {
  return (
    <div className="hero-card2">
      <h3>Today's News</h3>
      <div className="hero-card-items2">
        {data.slice(-10).map((element) => (
          <Link
            key={`news-${element._id}`}
            href={`/post/${encodeURIComponent(
              element.slugtitle.replaceAll(" ", "-")
            )}`}
          >
            {removeAsterisks(element.title)}
            <FaExternalLinkAlt className="link-icon" />
          </Link>
        ))}
      </div>
    </div>
  );
};
