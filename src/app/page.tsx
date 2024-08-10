import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
      <div className="hero-container-wrap">
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
      </div>{" "}
      <div className="hero-container-fixed">
        <div className="hero-card1">
          <h3>Hashtags</h3>
          <div className="hero-card1-items">
            <Badge>#all</Badge>
            <Badge>#ai</Badge>
            <Badge>#tech</Badge>
            <Badge>#gadgets</Badge>
            <Badge>#ai</Badge>
            <Badge>#tech</Badge>
            <Badge>#gadgets</Badge>
            <Badge>#Space</Badge>
            <Badge>#Robots</Badge>
            <Badge>#nano-tech</Badge>
            <Badge>#Social-media</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
