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
import CancelIcon from "@mui/icons-material/Cancel";
import Footer from "@/components/footer/footer";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { toast } = useToast();
  const hasReset = useRef(false);
  const heroContainerFixedRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef(null);

  const handleDateChange = (date: DateRange | null) => {
    setFilteredDate(date);
  };

  useEffect(() => {
    const footerElement = footerRef.current;
    const heroContainerFixed = heroContainerFixedRef.current;
    if (!footerElement || !heroContainerFixed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(heroContainerFixed);
        if (entry.isIntersecting) {
          heroContainerFixed?.classList.add("scrolled-to-bottom");
        } else {
          heroContainerFixed?.classList.remove("scrolled-to-bottom");
        }
      },
      {
        threshold: 0.9,
      }
    );

    if (footerElement) observer.observe(footerElement);
    return () => {
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
        title: "No results found for the selected Filter.",
      });
      setFilteredDate(null);
      setFilteredData(data);
    } else {
      hasReset.current = false;
      setFilteredData(newFilteredData);
    }
  }, [selectedTags, filteredDate, data]);

  const uniqueHashtags = useMemo(
    () =>
      Array.from(
        new Set(
          data.flatMap((item) => item.hashtags.map((tag) => tag.toLowerCase()))
        )
      ),
    [data]
  );
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (searchQuery) {
        const newFilteredData = data
          .map((item) => {
            const matchingHeadlines = item.headlines.filter((headline) =>
              headline.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchingHeadlines.length > 0
              ? { ...item, headlines: matchingHeadlines }
              : null;
          })
          .filter((item) => item !== null);

        if (newFilteredData.length === 0 && data.length > 0) {
          toast({
            title: "No results found for the search query.",
          });
          setFilteredData(data);
        } else {
          setFilteredData(newFilteredData);
        }
      }
      setLoading(false);
    }, 500);
  };

  const handleSearchReset = () => {
    setSearchQuery("");
    setFilteredData(data);
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="hero-parent">
          <div className="hero-container-wrap">
            <div className="hero-container-title">
              <Link href="/#">
                <h3>Your Tech Round-Up!</h3>
              </Link>
              <DatePickerComponent onDateChange={handleDateChange} />
            </div>
            {filteredData.map((val, index) => (
              <div key={val._id} className="hero-container">
                <div className="hero-container-head">
                  <h2>{val.title}</h2>

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
                  target="_blank"
                >
                  Read Full Article
                </Link>
              </div>
            ))}
          </div>
          <div className="hero-container-fixed" ref={heroContainerFixedRef}>
            <div className="hero-search">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  required
                />
                {searchQuery ? (
                  <CancelIcon
                    onClick={handleSearchReset}
                    className="cancel-icon"
                  />
                ) : (
                  ""
                )}
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
      <Footer footerRef={footerRef} />
    </div>
  );
};

export default Page;
