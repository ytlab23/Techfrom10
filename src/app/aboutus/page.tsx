import Footer from "@/components/footer/footer";
import "./aboutus.scss";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {}

export const metadata: Metadata = {
  title: "About us - techfrom10",
  description:
    "Every day, we pick the 10 most important tech stories from trusted sources, giving you a quick update on what’s happening in the techworld.",
};

const partnersInfo = [
  {
    image: "/partners/openai-icon.png",
    name: "OpenAI",
    link: "https://openai.com",
  },
  {
    image: "/partners/5app-icon.png",
    name: "5APP AI",
    link: "https://5app.ai/",
  },
  {
    image: "/partners/vercel-icon.png",
    name: "Vercel",
    link: "https://vercel.com/",
  },
  {
    image: "/partners/bing-icon.png",
    name: "Bing",
    link: "https://www.bing.com/",
  },
  {
    image: "/partners/gemini-icon.svg",
    name: "Gemini",
    link: "https://gemini.google.com/app",
  },
  {
    image: "/partners/lenos-icon.png",
    name: "Lenostube",
    link: "https://www.lenostube.com/en/",
  },
  {
    image: "/partners/asura-icon.png",
    name: "Asura Hosting",
    link: "https://www.asurahosting.com/",
  },
  {
    image: "/partners/oxy-icon.jpg",
    name: "Oxylabs",
    link: "https://oxylabs.io/",
  },
];

const Page: NextPage<Props> = ({}) => {
  return (
    <div>
      <div className="about-parent">
        <div className="about-head">
          <h1>About Us</h1>
        </div>
        <div className="about-container">
          <div className="about-content-head">
            <h3>Who are we?</h3>
          </div>
          <div className="about-content">
            <p>
              Every day, we pick the 10 most important tech stories from trusted
              sources, giving you a quick update on what’s happening in the tech
              world.
              <br /> <br />
              Our goal is to help you stay informed with just a few seconds of
              reading each day. We focus on delivering only the most relevant
              news, so you get the key information without spending too much
              time.
              <br />
              <br />
              The website is designed to be easy to use, with a clean and simple
              layout. The goal is to share the top technology news in a simple
              and clear way.
              <br />
              <br />
              Whether you love tech or just want to keep up with the latest
              trends, TechFrom10 gives you the essential news without any extra
            </p>
          </div>
        </div>
        <div className="about-partners">
          <div className="about-partners-head">
            <h3>Partners</h3>
          </div>

          <div className="about-partners-list">
            {partnersInfo.map((partner, index) => (
              <Link
                key={index}
                className="about-partners-item"
                href={partner.link}
                target="_blank"
              >
                <Image
                  src={partner.image}
                  alt={partner.name}
                  width={45}
                  height={50}
                />
                <h3>{partner.name}</h3>
              </Link>
            ))}
          </div>
          <div className="about-contact">
            <p>
              Interested in becoming our partner and being featured on this
              page? Contact us at{" "}
              <Link href={"mailto:contact@techfrom10.com"}>
                {" "}
                contact@techfrom10.com{" "}
              </Link>{" "}
              with "Partnership" in the subject line.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page;
