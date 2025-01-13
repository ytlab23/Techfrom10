import RenderBlog from "@/components/renderBlog/renderBlog";
import { NextPage } from "next";
import Footer from "@/components/footer/footer";
import { redirect } from "next/navigation";
interface Props {
  params: {
    title: string;
  };
}
export const generateMetadata = async ({ params }: Props) => {
  const title = params.title;
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchPost",
    {
      method: "POST",
      body: JSON.stringify({ title }),
    }
  );
  if (!res.ok)
    return {
      title: "Techfrom10",
    };
  const data = await res.json();
  return {
    title: `${data.slugtitle} - TechFrom10`,
  };
};

const Page: NextPage<Props> = async ({ params }) => {
  const title = params.title;
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_BASE_URL + "/api/fetchPost",
    {
      method: "POST",
      body: JSON.stringify({ title }),
      cache: "no-cache",
    }
  );
  if (res.status !== 200) return redirect("/");

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
