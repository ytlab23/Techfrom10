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

interface NewsItem {
  headline: string;
  title: string;
  slugtitle: string;
  headlines: string;
  summary: string;
  date: string;
  img_url?: string;
  source?: string;
}

interface CategoryProps {
  params: { category: string };
}

interface DateRange {
  from?: Date;
  to?: Date;
}

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

  const hasReset = useRef(false);

  const handleViewChange = (checked: boolean) => {
    setUnifiedView(checked);
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
  };

  useEffect(() => {
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
  }, [filteredDate, data]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredResults = filteredData.filter((item) =>
    item.headline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const renderUnifiedView = (value: NewsItem) => (
    <div className="hero-container unified-view" key={value.headline}>
      <div className="hero-content-wrap">
        <div className="category-right">
          <ul>
            <li>
              <Link
                href={`/article/${encodeURIComponent(
                  value.headline.replaceAll(" ", "-")
                )}`}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                {value.headline}
              </Link>
              <div className="flex gap-2 items-center">
                <Link
                  href={`/article/${encodeURIComponent(
                    value.headline.replaceAll(" ", "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view article"
                >
                  <FaEye />
                </Link>
                {value.source && (
                  <Link
                    href={value.source}
                    target="_blank"
                    rel="noreferrer nofollow noopener"
                    title="view full info"
                  >
                    <FaExternalLinkAlt fontSize={"12px"} />
                  </Link>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Link
        href={
          "/post/" + encodeURIComponent(value.slugtitle.replaceAll(" ", "-"))
        }
        target="_blank"
        className="view-in-full"
      >
        Read Full Article
      </Link>
    </div>
  );

  const renderDefaultView = (value: NewsItem) => (
    <div className="hero-container" key={value.headline}>
      <div className="hero-container-head">
        <span>
          <FaClock className="text-base" />
          {value.date}
        </span>
      </div>
      <div className="hero-content-wrap">
        {value.img_url && (
          <Image
            src={value.img_url}
            alt={value.headline}
            width={250}
            height={300}
          />
        )}
        <div className="category-right">
          <ul>
            <li>
              <Link
                href={`/article/${encodeURIComponent(
                  value.headline.replaceAll(" ", "-")
                )}`}
                target="_blank"
                rel="noreferrer nofollow noopener"
                title="view article"
              >
                {value.headline}
              </Link>
              <div className="flex gap-2 items-center">
                <Link
                  href={`/article/${encodeURIComponent(
                    value.headline.replaceAll(" ", "-")
                  )}`}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                  title="view article"
                >
                  <FaEye />
                </Link>
                {value.source && (
                  <Link
                    href={value.source}
                    target="_blank"
                    rel="noreferrer nofollow noopener"
                    title="view full info"
                  >
                    <FaExternalLinkAlt fontSize={"12px"} />
                  </Link>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Link
        href={
          "/post/" + encodeURIComponent(value.slugtitle.replaceAll(" ", "-"))
        }
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
        <div className="category-parent">
          <div className="category-parent-container">
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
                {filteredResults.map((value) =>
                  unifiedView
                    ? renderUnifiedView(value)
                    : renderDefaultView(value)
                )}
              </div>
            </div>

            <div className="category-parent-right">
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
                <h3>More News</h3>
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
