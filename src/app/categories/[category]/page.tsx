"use client";
import { useEffect, useState, useRef } from "react";
import "./category.scss";
import Image from "next/image";
import Link from "next/link";
import { FaExternalLinkAlt, FaEye, FaClock } from "react-icons/fa";
import DatePickerComponent from "@/components/dataPicker/datePicker";
import moment from "moment";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/footer/footer";
import Loading from "../../loading";
import { useRouter } from "next/navigation";
import DefaultView from "@/components/defaultView/defaultView";
import UnifiedView from "@/components/uniifiedView/unifiedView";
import { Button } from "@/components/ui/button";

interface NewsItem {
  _id: string;
  headline: string;
  title: string;
  slugtitle: string;
  headlines: string;
  summary: string;
  date: string;
  img_url?: string;
  source?: string;
  sources: string[];
  published: string;
  hashtags: string[];
}

interface CategoryProps {
  params: { category: string };
}

interface DateRange {
  from?: Date;
  to?: Date;
}

const ITEMS_PER_PAGE = 5;

const latestNewsData = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`
  );
  const data: NewsItem[] = await response.json();
  return data;
};

const CategoryPage = ({ params }: CategoryProps) => {
  const category = params.category;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<NewsItem[]>([]);
  const [filteredData, setFilteredData] = useState<NewsItem[]>([]);
  const [latestData, setLatestData] = useState<NewsItem[]>([]);
  const [filteredDate, setFilteredDate] = useState<{
    from: Date | null;
    to: Date | null;
  } | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unifiedView, setUnifiedView] = useState<boolean>(false);
  const [visibleItems, setVisibleItems] = useState<number>(ITEMS_PER_PAGE);

  const categoryParentContainerRef = useRef<HTMLDivElement>(null);
  const categoryParentRightRef = useRef<HTMLDivElement>(null);

  const hasReset = useRef(false);

  const handleViewChange = (checked: boolean) => {
    setUnifiedView(checked);
    setVisibleItems(ITEMS_PER_PAGE);
  };

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + ITEMS_PER_PAGE);
  };

  const handleDateChange = (date: DateRange | null) => {
    if (date) {
      setFilteredDate({
        from: date.from || null,
        to: date.to || null,
      });
    } else {
      setFilteredDate(null);
    }
    setVisibleItems(ITEMS_PER_PAGE);
  };

  useEffect(() => {
    const updateHeight = () => {
      if (
        categoryParentContainerRef.current &&
        categoryParentRightRef.current
      ) {
        const containerHeight = categoryParentContainerRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        categoryParentRightRef.current.style.height = `100%`;
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

  useEffect(() => {
    document.title = `latest ${params.category} news - Techfrom10`;
    const fetchData = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchCategory`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category }),
        }
      );

      if (response.status === 200) {
        const categoryData: NewsItem[] = await response.json();
        setData(categoryData);
        setFilteredData(categoryData);
      } else {
        router.push("/");
      }
      setLoading(false);
    };

    const fetchLatestNews = async () => {
      const latestNews = await latestNewsData();
      setLatestData(latestNews);
    };

    fetchData();
    fetchLatestNews();
  }, [category]);

  useEffect(() => {
    if (!filteredDate) {
      setFilteredData(data);
      return;
    }

    const from = moment(filteredDate.from).startOf("day");
    const to = filteredDate.to
      ? moment(filteredDate.to).endOf("day")
      : from.endOf("day");

    const newFilteredData = data.filter((item) =>
      moment(item.date).isBetween(from, to, null, "[]")
    );

    if (newFilteredData.length === 0) {
      toast({
        title: "No results found for the selected Filter.",
      });
      setFilteredData(data);
    } else {
      setFilteredData(newFilteredData);
    }
    setVisibleItems(ITEMS_PER_PAGE); //----
  }, [filteredDate, data]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setVisibleItems(ITEMS_PER_PAGE); //-----
  };

  const filteredResults = filteredData.filter((item) =>
    item.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const visibleResults = unifiedView
    ? filteredData
    : filteredResults.slice(0, visibleItems);
  const hasMoreItems = !unifiedView && visibleItems < filteredResults.length;

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="category-parent">
          <div
            className="category-parent-container"
            ref={categoryParentContainerRef}
          >
            <div className="category-parent-left">
              <div className="category-container-title">
                <Link href="/#">
                  <h3>Your Tech Round-Up!</h3>
                </Link>
                <div className="flex items-center gap-1">
                  <h3>Unified View</h3>
                  <Switch
                    checked={unifiedView}
                    onCheckedChange={handleViewChange}
                  />
                </div>{" "}
                <div className="flex items-center gap-4">
                  <DatePickerComponent onDateChange={handleDateChange} />
                </div>
              </div>
              <div className="category-hero-container-wrap">
                {unifiedView ? (
                  <UnifiedView
                    data={filteredResults.map((item) => ({
                      _id: item.slugtitle,
                      headlines: [item.headline],
                      published: [item.published],
                      sources: item.source ? [item.source] : [],
                    }))}
                  />
                ) : (
                  visibleResults.map((value) => (
                    <DefaultView
                      key={value.slugtitle}
                      val={{
                        _id: value.slugtitle,
                        title: value.title,
                        slugtitle: value.slugtitle,
                        headlines: [value.headline],
                        summary: [value.summary],
                        sources: value.source ? [value.source] : [],
                        published: [value.date],
                        hashtags: [],
                        img_url: value.img_url || "",
                        date: value.date,
                      }}
                    />
                  ))
                )}
                {hasMoreItems && (
                  <div className="load-more-button">
                    <Button onClick={handleLoadMore}>Load More</Button>
                  </div>
                )}
              </div>
            </div>

            <div className="category-parent-right" ref={categoryParentRightRef}>
              <div className="hero-category-search-container">
                <div className="category-search">
                  <form onSubmit={handleSearchSubmit}>
                    <input
                      type="text"
                      placeholder="Search News..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <button type="submit">Search</button>
                  </form>
                </div>
              </div>
              <div className="category-hero-card2">
                <h3>Latest News</h3>
                <div className="category-hero-card-items2">
                  {latestData.slice(-10).map((element) => (
                    <Link
                      key={element.headlines}
                      href={`/post/${encodeURIComponent(
                        element.slugtitle.replaceAll(" ", "-")
                      )}`}
                      target="_blank"
                    >
                      {element.title}
                      <FaExternalLinkAlt className="link-icon" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="category-footer">
        <Footer />
      </div>
    </div>
  );
};

export default CategoryPage;
