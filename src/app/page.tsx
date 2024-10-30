"use client";
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useMemo, useRef } from "react";
import { FaClock } from "react-icons/fa";
import moment from "moment";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import { FaExternalLinkAlt, FaEye } from "react-icons/fa";
import CancelIcon from "@mui/icons-material/Cancel";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/footer/footer"), {
  loading: () => <div>Loading...</div>,
});
const DatePickerComponent = dynamic(
  () => import("@/components/dataPicker/datePicker"),
  {
    ssr: false,
  }
);
const Loading = dynamic(() => import("./loading.js"), {
  loading: () => <div>Loading...</div>,
});

interface Props {}

interface dataprop {
  _id: string;
  title: string;
  slugtitle: string;
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
  const containerWrapRef = useRef<HTMLDivElement>(null);
  const containerFixedRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const hasReset = useRef(false);

  const handleViewChange = (checked: boolean) => {
    setUnifiedView(checked);
  };

  const handleDateChange = (date: DateRange | null) => {
    setFilteredDate(date);
  };

  useEffect(() => {
    const updateHeight = () => {
      if (containerWrapRef.current && containerFixedRef.current) {
        const wrapHeight = containerWrapRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;

        // If wrap height is less than 2 viewport heights (200vh)
        if (wrapHeight < viewportHeight * 1) {
          containerFixedRef.current.style.height = "100%";
        } else {
          containerFixedRef.current.style.height = `${wrapHeight}px`;
        }
      }
    };

    // Initial height set
    updateHeight();

    // Update height when window is resized
    window.addEventListener("resize", updateHeight);

    // Update height when data changes
    if (filteredData.length > 0) {
      updateHeight();
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [filteredData]);

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

  const handleTagSelection = (hashtag: string) => {
    if (hashtag === "others") {
      if (!selectedTags.includes("others")) {
        setSelectedTags(["others"]);
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
    <div className="hero-container unified-view" key={val._id}>
      <div className="hero-content-wrap">
        <ul>
          {val.headlines.map((h, hindex) => (
            <li key={`headline-${val._id}-${hindex}`}>
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
                  href={`/article/${encodeURIComponent(
                    h.replaceAll(" ", "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view article"
                  key={`view-${val._id}-${hindex}`}
                >
                  <FaEye />
                </Link>
                <Link
                  href={val.sources[hindex]}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view full info"
                  key={`source-${val._id}-${hindex}`}
                >
                  <FaExternalLinkAlt fontSize={"12px"} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={"/post/" + encodeURIComponent(val.slugtitle.replaceAll(" ", "-"))}
        target="_blank"
        className="view-in-full"
      >
        Read Full Article
      </Link>
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
            <li key={`headline-${val._id}-${hindex}`}>
              <Link
                href={`/article/${encodeURIComponent(h.replace(/\s+/g, "-"))}`}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                {hindex + 1}. {h}
              </Link>
              <div className="flex gap-2 items-center">
                <Link
                  href={`/article/${encodeURIComponent(
                    h.replace(/\s+/g, "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view article"
                  key={`view-${val._id}-${hindex}`}
                >
                  <FaEye />
                </Link>
                <Link
                  href={val.sources[hindex]}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view full info"
                  key={`source-${val._id}-${hindex}`}
                >
                  <FaExternalLinkAlt fontSize={"12px"} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Link
        href={"/post/" + encodeURIComponent(val.slugtitle.replaceAll(" ", "-"))}
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
          <div className="hero-container-wrap" ref={containerWrapRef}>
            <div className="hero-container-title">
              <Link href="/#">
                <h3>Your Tech Round-Up!</h3>
              </Link>
              <div className="hero-unified-view">
                <h3>Unified View </h3>
                <Switch
                  checked={unifiedView}
                  onCheckedChange={handleViewChange}
                />
              </div>
              <DatePickerComponent onDateChange={handleDateChange} />
            </div>
            {unifiedView
              ? filteredData.map((item) => renderUnifiedView(item))
              : filteredData.map((item) => renderDefaultView(item))}
          </div>
          <div className="hero-container-fixed" ref={containerFixedRef}>
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
                  <Link
                    key={`news-${element._id}`}
                    href={
                      "/post/" +
                      encodeURIComponent(element.slugtitle.replaceAll(" ", "-"))
                    }
                    target="_blank"
                  >
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
                {uniqueHashtags.map((hashtag) => (
                  <Badge
                    key={`hashtag-${hashtag}`}
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
      <Footer />
    </div>
  );
};

export default Page;
