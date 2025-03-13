// components/UnifiedView.tsx
import React from "react";
import Link from "next/link";
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";
import generateSlug, { removeAsterisks } from "@/helper/slugFormat";
import dateFormat from "@/helper/dateFormat";
interface UnifiedViewProps {
  data: {
    _id: string;
    headlines: string[];
    slugheadlines: string[];
    published: string[];
    sources: string[];
  }[];
}

const UnifiedView: React.FC<UnifiedViewProps> = ({ data }) => {
  return (
    <div className="unified-view">
      <div className="hero-content-wrap">
        <ul>
          {data.map((val) =>
            val.headlines.map((headline, hindex) => (
              <li key={`headline-${val._id}-${hindex}`}>
                <div className="hero-content-headline">
                  <Link
                    href={`/article/${generateSlug(headline)}`}
                    title="view article"
                  >
                    {removeAsterisks(headline)}
                  </Link>
                  <span>{dateFormat(val.published[hindex])}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Link
                    href={`/article/${generateSlug(headline)}`}
                    title="view article"
                  >
                    <FaEye />
                  </Link>
                  <Link
                    href={val.sources[hindex]}
                    target="_blank"
                    rel="noreferrer nofollow noopener"
                    title="view full info"
                  >
                    <FaExternalLinkAlt fontSize={"12px"} />
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default UnifiedView;
