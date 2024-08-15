"use client";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo, useRef } from "react";
import Loading from "./loading.js";
import { FaClock } from "react-icons/fa";
import DatePickerComponent from "@/components/dataPicker/datePicker";
import moment from "moment";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import { FaExternalLinkAlt } from "react-icons/fa";

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
  date: string;
}

const Page: NextPage<Props> = ({}) => {
  const [data, setData] = useState<dataprop[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["uncategorized"]);
  const [filteredData, setFilteredData] = useState<dataprop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredDate, setFilteredDate] = useState<DateRange | null>(null);
  const { toast } = useToast();
  const hasReset = useRef(false); // Track if the state has been reset
  const heroContainerWrapRef = useRef<HTMLDivElement>(null);
  const heroContainerFixedRef = useRef<HTMLDivElement>(null);
  const heroContainerRefs = useRef<HTMLDivElement[]>([]);

  const handleDateChange = (date: DateRange | null) => {
    setFilteredDate(date);
  };

  useEffect(() => {
    const heroContainerWrap = heroContainerWrapRef.current;
    const heroContainerFixed = heroContainerFixedRef.current;

    if (!heroContainerWrap || !heroContainerFixed) return;
    // heroContainerRefs.current = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log("Intersection");
          heroContainerFixed.classList.add("scrolled-to-bottom");
        } else {
          console.log("not Intersection");
          heroContainerFixed.classList.remove("scrolled-to-bottom");
        }
      },
      {
        rootMargin: "1%",
        threshold: 1,
      }
    );

    const lastElement = heroContainerRefs.current.slice(-1)[0];
    if (lastElement) {
      observer.observe(lastElement);
    }
    return () => {
      if (lastElement) {
        observer.unobserve(lastElement);
      }
      observer.disconnect();
    };
  }, [filteredData]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`,
        { next: { revalidate: 3600 } }
      );
      const data: dataprop[] = await res.json();
      setData(data);
      setFilteredData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleTagSelection = (hashtag: string) => {
    if (hashtag === "uncategorized") {
      if (!selectedTags.includes("uncategorized")) {
        setSelectedTags(["uncategorized"]);
      }
    } else {
      setSelectedTags((prevTags) =>
        prevTags.includes(hashtag)
          ? prevTags.filter((tag) => tag !== hashtag)
          : [...prevTags.filter((tag) => tag !== "uncategorized"), hashtag]
      );
    }
  };

  useEffect(() => {
    const selectedDateRange = filteredDate
      ? {
          from: moment(filteredDate.from).startOf("day"),
          to: filteredDate.to
            ? moment(filteredDate.to).endOf("day")
            : moment(filteredDate.from).endOf("day"),
        }
      : null;

    let newFilteredData = data;

    if (selectedTags.includes("uncategorized") || selectedTags.length === 0) {
      newFilteredData = data;
    } else {
      newFilteredData = data
        .map((item) => ({
          ...item,
          headlines: item.headlines.filter((_, idx) =>
            selectedTags.includes(item.hashtags[idx])
          ),
        }))
        .filter((item) => item.headlines.length > 0);
    }

    if (selectedDateRange) {
      newFilteredData = newFilteredData.filter((item) =>
        moment(item.date).isBetween(
          selectedDateRange.from,
          selectedDateRange.to,
          null,
          "[]"
        )
      );
    }

    if (newFilteredData.length === 0 && data.length > 0 && !hasReset.current) {
      hasReset.current = true;
      toast({
        title: "No results found for the selected date range.",
      });
      setFilteredDate(null);
      setFilteredData(data);
    } else {
      hasReset.current = false;
      setFilteredData(newFilteredData);
    }
  }, [selectedTags, filteredDate, data, toast]);

  const uniqueHashtags = useMemo(
    () =>
      Array.from(
        new Set(
          data.flatMap((item) => item.hashtags.map((tag) => tag.toLowerCase()))
        )
      ),
    [data]
  );

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="hero-parent">
          <div className="hero-container-wrap" ref={heroContainerWrapRef}>
            <div className="hero-container-title">
              <h3>Your Tech Round-Up!</h3>
              <DatePickerComponent onDateChange={handleDateChange} />
            </div>
            {filteredData.map((val, index) => (
              <div
                key={val._id}
                className="hero-container"
                ref={(el) => {
                  if (el) heroContainerRefs.current[index] = el;
                }}
              >
                <div className="hero-container-head">
                  <Link href={"/article/" + val._id.toString()}>
                    <h2>{val.title}</h2>
                  </Link>
                  <span>
                    <FaClock className="text-base" />
                    {val.date}
                  </span>
                </div>
                <div className="hero-content-wrap">
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
                <Link
                  href={"/article/" + val._id.toString()}
                  className="view-in-full"
                >
                  Read Full Article
                </Link>
              </div>
            ))}
          </div>
          <div className="hero-container-fixed" ref={heroContainerFixedRef}>
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
                  onClick={() => handleTagSelection("uncategorized")}
                  className={
                    selectedTags.includes("uncategorized")
                      ? "selected-hashtag"
                      : "unselected-hashtag"
                  }
                >
                  #Uncategorized
                </Badge>
                {uniqueHashtags.map((hashtag, index) => (
                  <Badge
                    key={index}
                    onClick={() => handleTagSelection(hashtag)}
                    className={
                      selectedTags.includes(hashtag)
                        ? "selected-hashtag"
                        : "unselected-hashtag"
                    }
                  >
                    #{hashtag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="hero-card2">
              <h3>Recent Posts</h3>
              <div className="hero-card-items2">
                {data.slice(-3).map((element) => (
                  <Link href={"/article/" + element._id} target="_blank">
                    {element.title} <FaExternalLinkAlt className="link-icon" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
