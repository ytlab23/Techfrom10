"use client";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface Props {}

interface dataprop {
  _id: string;
  title: string;
  headlines: string[];
  summary: string[];
  source: string[];
  published: string[];
  hashtags: string[];
  imgUrl: string;
}

const Page: NextPage<Props> = ({}) => {
  const [data, setData] = useState<dataprop[]>([]);
  const [tag, setTag] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<dataprop[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`,
        { cache: "no-cache" }
      );
      const data: dataprop[] = await res.json();
      setData(data);
      setTag("Uncategorized");
      setFilteredData(data);
    };
    fetchData();
  }, []);

  const handleTag = (hashtag: string) => {
    setTag(hashtag);
  };

  useEffect(() => {
    if (tag) {
      if (tag == "Uncategorized") return setFilteredData(data);
      const newFilteredData = data
        .map((item) => ({
          ...item,
          headlines: item.headlines.filter(
            (_, idx) => item.hashtags[idx] === tag
          ),
        }))
        .filter((item) => item.headlines.length > 0);

      setFilteredData(newFilteredData);
    } else {
      setFilteredData(data);
    }
  }, [tag, data]);

  return (
    <div className="hero-parent">
      <div className="hero-container-wrap">
        {filteredData.map((val) => (
          <div key={val._id} className="hero-container">
            <div className="hero-container-head">
              <Link href={"/view/" + val._id.toString()}>
                <h2>{val.title}</h2>
              </Link>
            </div>
            <div className="hero-content-wrap">
              {" "}
              <Image
                src={val.imgUrl ? `${val.imgUrl}` : "/test.jpg"}
                width={250}
                height={1024}
                alt={val.title}
              />
              <ul>
                {val.headlines.map((h, hindex) => (
                  <li key={hindex}>{h}</li>
                ))}
              </ul>
            </div>
            <Link href={"/view/" + val._id.toString()} className="view-in-full">
              View in Full
            </Link>
          </div>
        ))}
      </div>
      <div className="hero-container-fixed">
        <div className="hero-search">
          <form action="submit">
            <input type="text" placeholder="search" />
            <button>search</button>
          </form>
        </div>
        <div className="hero-card1">
          <h3>Hashtags</h3>
          <div className="hero-card1-items">
            <Badge
              key="uncategorized"
              onClick={() => handleTag("Uncategorized")}
              className={
                tag === "Uncategorized"
                  ? "selected-hashtag"
                  : "unselected-hashtag"
              }
            >
              #Uncategorized
            </Badge>
            {Array.from(
              new Set(
                data.flatMap((item) =>
                  item.hashtags.map((tag) => tag.toLowerCase())
                )
              )
            ).map((hashtag, index) => (
              <Badge
                key={index}
                onClick={() => handleTag(hashtag)}
                className={
                  tag === hashtag ? "selected-hashtag" : "unselected-hashtag"
                }
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
