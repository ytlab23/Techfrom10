import RenderBlog from "@/components/renderBlog/renderBlog";
import { NextPage } from "next";

interface Props {
  params: {
    id: string;
  };
}

const Page: NextPage<Props> = async ({ params }) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchRoundup",
    {
      method: "POST",
      body: JSON.stringify(params),
      cache: "no-cache",
    }
  );
  const data = await res.json();
  return (
    <div>
      <RenderBlog
        headline={data.headlines}
        summary={data.summary}
        source={data.source}
        time={data.published}
      />
    </div>
  );
};

export default Page;
