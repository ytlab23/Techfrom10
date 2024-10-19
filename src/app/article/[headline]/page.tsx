import "./article.scss";
import Link from "next/link";
import { NextPage, Metadata } from "next";
import Footer from "@/components/footer/footer";

interface Props {
  params: any;
}

export async function generateMetadata({ params }: Props) {
  const headline = decodeURIComponent(params.headline.replaceAll("-", " "));
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify({ headline }),
    }
  );
  const data = await res.json();
  return {
    title: `${data.headline} - TechFrom10`,
    description: data.summary,
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const headline = decodeURIComponent(params.headline.replaceAll("-", " "));

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify({ headline }),
    }
  );
  const data = await res.json();

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
              href={"https://" + data.source}
              target="_blank"
              rel="noreferrer nofollow noopener"
            >
              Read More
            </Link>
          </div>
        </div>
      </div>
      <div className="article-footer">
        <Footer />
      </div>
    </div>
  );
};

export default Page;
