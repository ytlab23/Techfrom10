import { useState, useEffect } from "react";
import moment from "moment";
import { DataProps } from "@/types";

export const useDataFetching = () => {
  const [data, setData] = useState<DataProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`
        );
        const data: DataProps[] = await res.json();
        const sortedData = [...data].sort(
          (a, b) =>
            moment(b.date, "MMM D, YYYY").valueOf() -
            moment(a.date, "MMM D, YYYY").valueOf()
        );
        setData(sortedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, loading };
};
