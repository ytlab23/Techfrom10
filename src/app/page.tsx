import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
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
    `${process.env.NEXT_PUBLIC_API_BASE_URL}` + "/api/fetchRoundup",
    { cache: "no-cache" }
  );
  const data: dataprop[] = await res.json();
  return (
    <div className="hero-parent">
      <h1>
        Best of the Week
        <span>See All Posts...</span>
      </h1>

      {data.map((val, index) => (
        <div key={index + 1} className="hero-container">
          <div className="hero-container-head">
            {" "}
            <h2>{val.title}</h2>
            <Image
              src={"/test.jpg"}
              width={250}
              height={1024}
              alt={val.title}
            />
          </div>{" "}
          <ul>
            {val.headlines.map((h, hindex) => (
              <li key={hindex + 2}>{h}</li>
            ))}
            <Link href={"/view/" + val._id.toString()}>View in Full</Link>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Page;
