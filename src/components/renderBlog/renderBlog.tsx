import { NextPage } from "next";
import Image from "next/image";

interface Props {
  headline: string[];
  summary: string[];
  source: string[];
  time: string[];
}

const RenderBlog: NextPage<Props> = ({ headline, summary, source, time }) => {
  return (
    <div>
      {headline.map((title, index) => (
        <div key={index + 3}>
          <h1>{title}</h1>
          <p>{summary[index]}</p>
          <p>Source: {source[index]}</p>
          <p>Published: {time[index]}</p>
        </div>
      ))}
    </div>
  );
};

export default RenderBlog;
