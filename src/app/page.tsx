import { NextPage } from "next";
import Link from "next/link";
interface Props {}
interface dataprop {
  _id: string;
  title: string;
  headlines: string[];
  summary: string[];
  source: string[];
  published: string[];
  hashtags: string[];
}
const Page: NextPage<Props> = async ({}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/fetchRoundup"
  );
  const data: dataprop[] = await res.json();
  return (
    <div className="hero-parent">
      <div className="hero-container">
        {data.map((val, index) => (
          <div key={index + 1}>
            <h2>{val.title}</h2>
            {val.headlines.map((h, hindex) => (
              <p key={hindex + 2}>{h}</p>
            ))}
            <Link href={"/view/" + val._id.toString()}>View in Full</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Page;
