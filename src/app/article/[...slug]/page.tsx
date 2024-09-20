import "./article.scss";
import Link from "next/link";
import { NextPage, Metadata } from "next";
import Footer from "@/components/footer/footer";

interface Props {
  params: any;
}

export async function generateMetadata({ params }) {
  const title = params.slug[0];
  const id = params.slug[1];
  const articleId = params.slug[2];
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify({ id: id }),
    }
  );
  const data = await res.json();
  return {
    title: `${data.headlines[articleId]} | TechFrom10`,
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const id = params.slug[1];
  const articleId = params.slug[2];

  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify({ id: id }),
    }
  );
  const data = await res.json();
  return (
    <div className="article-main">
      <div className="article-container">
        <div className="article-content">
          <div className="article-content-sub">
            <h1>{data.headlines[articleId]}</h1>
            <p>{data.summary[articleId]}</p>
          </div>
          <div className="article-extra">
            <p>{data.published[articleId]}</p>
            <Link
              href={"https://" + data.source[articleId]}
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
