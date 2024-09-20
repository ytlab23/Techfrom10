import RenderBlog from "@/components/renderBlog/renderBlog";
import { NextPage } from "next";
import Footer from "@/components/footer/footer";

interface Props {
  params: {
    id: string;
  };
}
export const generateMetadata = async ({ params }: { params: string }) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify(params),
      cache: "no-cache",
    }
  );
  const data = await res.json();
  return {
    title: `${data.date} - ${data.title} | TechFrom10`,
  };
};
const Page: NextPage<Props> = async ({ params }) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify(params),
    }
  );
  const data = await res.json();
  return (
    <div>
      <RenderBlog
        title={data.title}
        headline={data.headlines}
        summary={data.summary}
        source={data.source}
        time={data.published}
      />
      <Footer />
    </div>
  );
};

export default Page;
