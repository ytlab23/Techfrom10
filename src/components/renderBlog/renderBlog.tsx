import { NextPage } from "next";
import "./renderBlog.scss";
import Link from "next/link";

interface Props {
  title: string;
  headline: string[];
  summary: string[];
  source: string[];
  time: string[];
}

const RenderBlog: NextPage<Props> = ({
  title,
  headline,
  summary,
  source,
  time,
}) => {
  return (
    <div className="renderBlog-parent">
      <h1>{title}</h1>
      <div className="render-wrap">
        {headline.map((title, index) => (
          <div key={index + 3} className="render-container">
            <h2>
              <li>
                {index + 1}. {title}
              </li>
            </h2>
            <div>
              <h3>{summary[index]}</h3>

              <p>
                {" "}
                <Link
                  href={"https://" + source[index]}
                  target="_blank"
                  rel="noreferrer nofollow noopener"
                >
                  Read More
                </Link>{" "}
                <span>{time[index]}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RenderBlog;
