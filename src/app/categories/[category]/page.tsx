import { redirect } from "next/navigation";
import "./category.scss";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";

interface NewsItem {
  headline: string;
  summary: string;
  published: string;
  img_url?: string;
  source?: string;
}

interface CategoryParams {
  params: {
    category: string;
  };
}

const latestNewsData = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`
  );

  const data: NewsItem[] = await response.json();
  return data;
};

const CategoryPage = async ({ params }: CategoryParams) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchCategory`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: params.category }),
      cache: "no-cache",
    }
  );

  if (response.status !== 200) redirect("/");

  const data: NewsItem[] = await response.json();
  const latestData = await latestNewsData();
  return (
    <div className="category-parent">
      <div className="category-title">
        <h1>{params.category} News</h1>
      </div>
      <div className="category-parent-container">
        <div className="category-parent-left">
          <div className="category-hero-container-wrap">
            {data.map((value) => (
              <div className="category-container-wrap" key={value.headline}>
                {value.img_url && (
                  <Image
                    src={value.img_url}
                    alt={value.headline}
                    width={250}
                    height={300}
                  />
                )}
                <div className="category-right">
                  <ul>
                    <li>
                      <Link
                        href={`/article/${encodeURIComponent(
                          value.headline.replaceAll(" ", "-")
                        )}`}
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                        title="view article"
                      >
                        {value.headline}
                      </Link>
                    </li>
                  </ul>
                  <div className="flex gap-2 items-center">
                    <Link
                      href={`/article/${encodeURIComponent(
                        value.headline.replaceAll(" ", "-")
                      )}`}
                      target="_blank"
                      rel="noreferrer nofollow noopener"
                      title="view article"
                    >
                      <FaEye />
                    </Link>
                    {value.source && (
                      <Link
                        href={`${value.source}`}
                        target="_blank"
                        rel="noreferrer nofollow noopener"
                        title="view full info"
                      >
                        <FaExternalLinkAlt fontSize={"12px"} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="category-parent-right">
          <div className="hero-category-search-container">
            <div className="category-search">
              <form>
                <input type="text" placeholder="Search News..." />
                <button type="submit">Search</button>
              </form>
            </div>
          </div>
          <div className="category-hero-card2">
            <h3>More News</h3>
            <div className="category-hero-card-items2">
              {latestData.slice(-10).map((element) => (
                <Link
                  key={element.headlines}
                  href={`/post/${encodeURIComponent(
                    element.slugtitle.replaceAll(" ", "-")
                  )}`}
                  target="_blank"
                >
                  {element.title}{" "}
                  {/* Changed from element.title to element.headline */}
                  <FaExternalLinkAlt className="link-icon" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
