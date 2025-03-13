"use client";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import moment from "moment";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import dynamic from "next/dynamic";
import DefaultView from "@/components/defaultView/defaultView";
import UnifiedView from "@/components/uniifiedView/unifiedView";
import { SearchBar } from "@/components/searchbar/searchBar";
import { NewsCard } from "@/components/newsCard/newsCard";
import { TopicsCard } from "@/components/topicsCard/topicsCard";
import { useDataFetching } from "@/hooks/useDataFetching";
import { DataProps } from "@/types";

const Footer = dynamic(() => import("@/components/footer/footer"));
const DatePickerComponent = dynamic(
  () => import("@/components/dataPicker/datePicker"),
  {
    ssr: false,
  }
);
const Loading = dynamic(() => import("./loading.js"));

const Page: NextPage = ({}) => {
  const { data, loading } = useDataFetching();
  const [selectedTags, setSelectedTags] = useState<string[]>(["uncategorized"]);
  const [filteredData, setFilteredData] = useState<DataProps[]>([]);
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
  }, [filteredData, unifiedView]);

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
      const sortedFilteredData = [...newFilteredData].sort(
        (a, b) =>
          moment(b.date, "MMM D, YYYY").valueOf() -
          moment(a.date, "MMM D, YYYY").valueOf()
      );
      setFilteredData(sortedFilteredData);
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
            {unifiedView ? (
              <UnifiedView data={filteredData} /> // Pass filteredData to the UnifiedView
            ) : (
              filteredData.map((item) => (
                <DefaultView
                  key={item._id}
                  val={item}
                  completeCheck={
                    selectedTags.includes("uncategorized") ||
                    selectedTags.length === 0
                  }
                />
              ))
            )}
          </div>
          <div className="hero-container-fixed" ref={containerFixedRef}>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              handleSearchReset={handleSearchReset}
            />
            <NewsCard data={data} />
            <TopicsCard
              uniqueHashtags={uniqueHashtags}
              selectedTags={selectedTags}
              handleTagSelection={handleTagSelection}
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Page;
