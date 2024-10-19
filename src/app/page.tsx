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
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";
import CancelIcon from "@mui/icons-material/Cancel";
import Footer from "@/components/footer/footer";
import { Switch } from "@/components/ui/switch";

interface Props {}

interface dataprop {
  _id: string;
  title: string;
  headlines: string[];
  summary: string[];
  sources: string[];
  published: string[];
  hashtags: string[];
  img_url: string;
  date: string;
}

const Page: NextPage<Props> = ({}) => {
  const [data, setData] = useState<dataprop[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["uncategorized"]);
  const [filteredData, setFilteredData] = useState<dataprop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredDate, setFilteredDate] = useState<DateRange | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unifiedView, setUnifiedView] = useState<boolean>(false);

  const { toast } = useToast();
  const hasReset = useRef(false);
  const heroContainerFixedRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef(null);

  const handleViewChange = (checked: boolean) => {
    setUnifiedView(checked);
  };

  const handleDateChange = (date: DateRange | null) => {
    setFilteredDate(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`
      );
      const data: dataprop[] = await res.json();
      setLoading(false);
      setData(data);
      setFilteredData(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const footerElement = footerRef.current;
    const heroContainerFixed = heroContainerFixedRef.current;
    if (!footerElement || !heroContainerFixed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
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

  const renderUnifiedView = (val: dataprop) => (
    <div className="hero-content-wrap hero-container unified-view">
      <ul>
        {val.headlines.map((h, hindex) => (
          <li key={`${val._id}-${hindex}`}>
            <Link
              href={`/article/${encodeURIComponent(h.replaceAll(" ", "-"))}`}
              target="_blank"
              rel="noreferrer nofollow noopener"
              title="view article"
            >
              {h}
            </Link>
            <div className="flex gap-2 items-center">
              <Link
                href={`/article/${encodeURIComponent(h.replaceAll(" ", "-"))}`}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                <FaEye />
              </Link>
              <Link
                href={"https://" + val.sources[hindex]}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view full info"
              >
                <FaExternalLinkAlt fontSize={"12px"} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderDefaultView = (val: dataprop) => (
    <div className="hero-container" key={val._id}>
      <div className="hero-container-head">
        <span>
          <FaClock className="text-base" />
          {val.date}
        </span>
      </div>
      <div className="hero-content-wrap">
        <Image
          src={val.img_url ? `${val.img_url}` : "/test.jpg"}
          width={250}
          height={1024}
          alt={val.title}
        />
        <ul>
          {val.headlines.map((h, hindex) => (
            <li key={hindex}>
              <Link
                key={hindex}
                href={`/article/${encodeURIComponent(h.replace(/\s+/g, "-"))}`}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                {hindex + 1}. {h}
              </Link>
              <div className="flex gap-2 items-center">
                <Link
                  key={hindex}
                  href={`/article/${encodeURIComponent(
                    h.replace(/\s+/g, "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view article"
                >
                  {" "}
                  <FaEye />
                </Link>
                <Link
                  key={hindex}
                  href={"https://" + val.sources[hindex]}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view full info"
                >
                  {" "}
                  <FaExternalLinkAlt fontSize={"12px"} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={"/post/" + val._id.toString()}
        target="_blank"
        className="view-in-full"
      >
        Read Full Article
      </Link>
    </div>
  );
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
              <div className="flex items-center gap-1">
                <h3>Unified View </h3>
                <Switch
                  checked={unifiedView}
                  onCheckedChange={handleViewChange}
                />
              </div>
              <DatePickerComponent onDateChange={handleDateChange} />
            </div>
            {unifiedView
              ? filteredData.map(renderUnifiedView)
              : filteredData.map(renderDefaultView)}
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

            <div className="hero-card2">
              <h3>Today's News</h3>
              <div className="hero-card-items2">
                {data.slice(-10).map((element) => (
                  <Link href={"/post/" + element._id} target="_blank">
                    {element.title} <FaExternalLinkAlt className="link-icon" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="hero-card1">
              <h3>Topics</h3>
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
                  #Others
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
      <Footer footerRef={footerRef} />
    </div>
  );
};

export default Page;
