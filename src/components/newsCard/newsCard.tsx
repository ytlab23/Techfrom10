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
        {data
          .reverse()
          .slice(1, 11)
          .map((element) => (
            <div className="flex items-center" key={`news-${element._id}`}>
              <Link
                className="!line-clamp-1"
                href={`/post/${encodeURIComponent(
                  element.slugtitle.replaceAll(" ", "-")
                )}`}
              >
                {removeAsterisks(element.title)}
              </Link>
              <span>
                <Link
                  href={`/post/${encodeURIComponent(
                    element.slugtitle.replaceAll(" ", "-")
                  )}`}
                >
                  <FaExternalLinkAlt className="link-icon" />
                </Link>
              </span>
            </div>
          ))}
      </div>
    </div>
  );
};
