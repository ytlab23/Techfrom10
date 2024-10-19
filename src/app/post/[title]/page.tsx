import RenderBlog from "@/components/renderBlog/renderBlog";
import { NextPage } from "next";
import Footer from "@/components/footer/footer";

interface Props {
  params: {
    title: string;
  };
}
export const generateMetadata = async ({ params }: Props) => {
  const title = decodeURIComponent(params.title.replaceAll("-", " "));
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchPost",
    {
      method: "POST",
      body: JSON.stringify({ title }),
      cache: "no-cache",
    }
  );
  const data = await res.json();
  return {
    title: `${data.title} - TechFrom10`,
  };
};

const Page: NextPage<Props> = async ({ params }) => {
  const title = decodeURIComponent(params.title.replaceAll("-", " "));
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchPost",
    {
      method: "POST",
      body: JSON.stringify({ title }),
    }
  );
  const data = await res.json();
  return (
    <div>
      <RenderBlog
        title={data.title
          .replace(
            /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}\b/,
            ""
          )
          .trim()}
        headline={data.headlines}
        summary={data.summaries}
        source={data.sources}
        time={data.published}
      />
      <Footer />
    </div>
  );
};

export default Page;
