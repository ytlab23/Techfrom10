"use client";
import "./Header.scss";
import { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import NewsletterPopup from "../newsletter/newsletterPopup";

import { Dropdown, Button, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import MobHeader from "./mobHeader";

interface Props {}

const Header: NextPage<Props> = ({}) => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".nav-parent");
      const navExtend = document.querySelector(".nav-container");

      if (window.scrollY > 10) {
        navbar?.classList.add("nav-parent-scrolled");
        navbar?.classList.remove("nav-parent-default");
        navExtend?.classList.add("hide-navextend");
      } else {
        navExtend?.classList.remove("hide-navextend");
        navbar?.classList.remove("nav-parent-scrolled");
        navbar?.classList.add("nav-parent-default");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const categories = [
    { key: "1", label: "Software", route: "software" },
    { key: "2", label: "AI", route: "ai" },
    { key: "3", label: "Space", route: "space" },
    { key: "4", label: "Social Media", route: "socialmedia" },
    { key: "5", label: "Biotechnology", route: "biotechnology" },
    { key: "6", label: "Gadgets", route: "gadgets" },
    { key: "7", label: "Video Games", route: "videogames" },
    { key: "8", label: "Innovations", route: "innovations" },
    // { key: "9", label: "Coding" },
    // { key: "10", label: "Mobile" },
    // { key: "11", label: "Robotics" },
    // { key: "12", label: "Cybersecurity" },
    // { key: "13", label: "Virtual Reality" },
    // { key: "14", label: "Quantum Computing" },
    // { key: "15", label: "Hardware" },
    // { key: "16", label: "Tutorials" },
    // { key: "17", label: "Smart Home" },
    // { key: "18", label: "Startups" },
  ];

  return (
    <div className="nav-main">
      <div className="nav-parent nav-parent-default">
        <div className="nav-container">
          <div className="nav-left">
            <h1>
              <Link href="/">TechFrom10 </Link>
            </h1>
            <ul>
              <Link href="/">Home</Link>
              <li onClick={() => setIsNewsletterOpen(true)}>Newsletter</li>
              <Link href={"/aboutus"}>About Us</Link>
            </ul>
          </div>
        </div>
        {isNewsletterOpen && (
          <NewsletterPopup
            onClose={() => setIsNewsletterOpen(false)}
            isOpen={isNewsletterOpen}
            setIsNewsletterOpen={setIsNewsletterOpen}
          />
        )}
        <div className="border-line" />
        <div className="nav-items">
          <ul>
            {categories.map((category) => (
              <li key={category.key}>
                <Link
                  href={`/categories/${category.route
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <MobHeader />
    </div>
  );
};

export default Header;
