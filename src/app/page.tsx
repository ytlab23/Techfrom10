"use client";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo } from "react";
import Loading from "./loading.js";
import { FaClock } from "react-icons/fa";
import DatePickerComponent from "@/components/dataPicker/datePicker";
import moment from "moment";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
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
  const [filteredDate, setFilteredDate] = useState<DateRange | null>({
    from: new Date(),
    to: new Date(),
  });
  const { toast } = useToast();
  const handleDateChange = (date: DateRange | null) => {
    setFilteredDate(date);
  };
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

    if (newFilteredData.length === 0 && data.length > 0) {
      toast({
        title: "No results found for the selected date range.",
      });
      setFilteredDate({
        from: new Date(),
        to: new Date(),
      });
      newFilteredData = data;
    } else {
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
          <div className="hero-container-wrap">
            <div className="hero-container-title">
              <h3>Filter</h3>
              <DatePickerComponent onDateChange={handleDateChange} />
            </div>
            {filteredData.map((val) => (
              <div key={val._id} className="hero-container">
                <div className="hero-container-head">
                  <Link href={"/view/" + val._id.toString()}>
                    <h2>{val.title}</h2>
                  </Link>
                  <span>
                    <FaClock className="text-base" />
                    {val.date}
                  </span>
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
                <Link
                  href={"/article/" + val._id.toString()}
                  className="view-in-full"
                >
                  Read Full Article
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
