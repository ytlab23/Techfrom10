import "./article.scss";
import Link from "next/link";
import { NextPage } from "next";
import Footer from "@/components/footer/footer";
import Image from "next/image";

interface Params {
  headline: string;
}

interface ArticleData {
  headline: string;
  summary: string;
  published: string;
  source: string;
  hashtags: string;
  img_url?: string; // Optional if not always present
}

interface CategoryNews {
  img_url: string;
  headline: string;
  summary: string;
  source?: string;
}

interface Props {
  params: Params;
}

export async function generateMetadata({ params }: Props) {
  const headline = decodeURIComponent(params.headline.replaceAll("-", " "));
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`,
    {
      method: "POST",
      body: JSON.stringify({ headline }),
    }
  );

  const data: ArticleData = await res.json();

  return {
    title: `${data.headline} - TechFrom10`,
    description: data.summary,
  };
}

const fetchCategoryNews = async (
  latestData: ArticleData,
  currentImgUrl: string,
  count = 6
): Promise<CategoryNews[]> => {
  const categoryResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchCategory`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ category: latestData.hashtags }),
      cache: "no-cache",
    }
  );

  const categoryData: CategoryNews[] = await categoryResponse.json();

  const uniqueLatestData = categoryData.filter(
    (news) => news.source !== currentImgUrl
  );

  return uniqueLatestData.slice(0, count);
};

const Page: NextPage<Props> = async ({ params }) => {
  const headline = decodeURIComponent(params.headline.replaceAll("-", " "));

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`,
    {
      method: "POST",
      body: JSON.stringify({ headline }),
      cache: "no-cache",
    }
  );

  const data: ArticleData = await res.json();

  const categoryNewsData = await fetchCategoryNews(data, data.source);

  return (
    <div className="article-main">
      <div className="article-container">
        <div className="article-content">
          <div className="article-content-sub">
            <h1>{data.headline}</h1>
            <p>{data.summary}</p>
          </div>
          <div className="article-extra">
            <p>{data.published}</p>
            <Link
              href={data.source}
              target="_blank"
              rel="noreferrer nofollow noopener"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>

      <div className="news-border" />
      <div className="news-latest">
        <h3>More{" "}
          <Link className="news-latest-link" href={`/categories/${data.hashtags}`}>{data.hashtags}</Link>
          {" "}News
        </h3>
        <div className="parent-latest-news-container">
          {categoryNewsData.map((value, index) => (
            <div key={index} className="news-latest-left-container">
              <Image
                src={value.img_url}
                alt={value.headline}
                width={125}
                height={250}
              />

              <div className="news-latest-right-container">
                <h3>{value.headline.replaceAll("-", " ")}</h3>
                <p>{value.summary}</p>
                <div className="news-read-more">
                  <Link
                    href={
                      "/article/" +
                      encodeURIComponent(value.headline.replaceAll(" ", "-"))
                    }
                    target="_blank"
                  >
                    Continue Reading
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="article-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Page;