"use client";
import { NextPage } from "next";
import "./Header.scss";
import Link from "next/link";
import { IoMenu, IoCloseSharp } from "react-icons/io5";
import { MdUnsubscribe, MdContactMail } from "react-icons/md";
import NewsletterPopup from "../newsletter/newsletterPopup";
import { useState } from "react";

interface Props {}

const categories = [
  { path: "/ai", label: "AI" },
  { path: "/software", label: "Software" },
  { path: "/space", label: "Space" },
  { path: "/social-media", label: "Social Media" },
  { path: "/biotechnology", label: "Biotechnology" },
  { path: "/gadgets", label: "Gadgets" },
  { path: "/video-games", label: "Video Games" },
  { path: "/innovations", label: "Innovations" },
];

const MobHeader: NextPage<Props> = ({}) => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const handleClick = () => {
    const element = document.querySelector(".navmob-container");
    element?.classList.toggle("navmob-show");
    document.body.classList.toggle("no-scroll");
  };

  return (
    <div className="navmob-parent">
      {isNewsletterOpen && (
        <NewsletterPopup
          onClose={() => setIsNewsletterOpen(false)}
          isOpen={isNewsletterOpen}
          setIsNewsletterOpen={setIsNewsletterOpen}
        />
      )}
      <div className="navmob-head">
        <Link href={"/"}>
          <h1>Techfrom10</h1>
        </Link>
        <IoMenu size={32} onClick={handleClick} />
      </div>
      <div className="navmob-container">
        <div className="close-icon">
          <IoCloseSharp color="white" size={32} onClick={handleClick} />
        </div>
        <div className="navmob-items">
          <div className="navmob-head-items">
            <h3
              onClick={() => {
                handleClick();
                setIsNewsletterOpen(true);
              }}
            >
              <MdUnsubscribe size={24} />
              Newsletter
            </h3>
            <Link onClick={handleClick} href={"/aboutus"}>
              <MdContactMail size={20} />
              About Us
            </Link>
          </div>
          <div className="aaa">
            <h3>category</h3>
            {categories.map((category) => (
              <ul className="navmob-item" key={category.path}>
                <li>
                  <Link
                    onClick={handleClick}
                    href={`/categories/${category.path}`}
                  >
                    {category.label}
                  </Link>
                </li>
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobHeader;
