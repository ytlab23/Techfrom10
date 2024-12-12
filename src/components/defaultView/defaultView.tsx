import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaClock } from "react-icons/fa";
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";

interface Props {
  val: {
    _id: string;
    title: string;
    slugtitle: string;
    headlines: string[];
    summary: string[];
    sources: string[];
    published: string[];
    hashtags: string[];
    img_url: string;
    date: string;
  };
}

const DefaultView: NextPage<Props> = ({ val }) => {
  return (
    <div className="hero-container" key={val._id}>
      <div className="hero-container-head">
        <span>
          <FaClock className="text-base" />
          {val.date}
        </span>
      </div>
      <div className="hero-content-wrap">
        <Image
          src={val.img_url ? `${val.img_url}` : "/test.jpg"}
          width={250}
          height={1024}
          alt={val.title}
        />
        <ul>
          {val.headlines.map((h, hindex) => (
            <li key={`headline-${val._id}-${hindex}`}>
              <Link
                href={`/article/${encodeURIComponent(h.replace(/\s+/g, "-"))}`}
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                {hindex + 1}. {h}
              </Link>
              <div className="flex gap-2 items-center">
                <Link
                  href={`/article/${encodeURIComponent(
                    h.replace(/\s+/g, "-")
                  )}`}
                  title="view article"
                  key={`view-${val._id}-${hindex}`}
                >
                  <FaEye />
                </Link>
                <Link
                  href={val.sources[hindex]}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view full info"
                  key={`source-${val._id}-${hindex}`}
                >
                  <FaExternalLinkAlt fontSize={"12px"} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={"/post/" + encodeURIComponent(val.slugtitle.replaceAll(" ", "-"))}
        className="view-in-full"
      >
        Read Full Article
      </Link>
    </div>
  );
};

export default DefaultView;
