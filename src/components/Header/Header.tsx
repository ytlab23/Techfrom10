"use client";
import "./Header.scss";
import { NextPage } from "next";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import msgIcon from "@/assets/icons/msg.svg";
import { useEffect, useState } from "react";
import NewsletterPopup from "../newsletter/newsletterPopup";

import { Dropdown, Button, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";

interface Props {}

const Header: NextPage<Props> = ({}) => {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".nav-parent");
      if (window.scrollY > 10) {
        navbar?.classList.add("nav-parent-scrolled");
        navbar?.classList.remove("nav-parent-default");
      } else {
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
    { key: "1", label: "Software" },
    { key: "2", label: "AI" },
    { key: "3", label: "Space" },
    { key: "4", label: "Social Media" },
    { key: "5", label: "Biotechnology" },
    { key: "6", label: "Gadgets" },
    { key: "7", label: "Video Games" },
    { key: "8", label: "Innovations" },
    { key: "9", label: "Coding" },
    { key: "10", label: "Mobile" },
    { key: "11", label: "Robotics" },
    { key: "12", label: "Cybersecurity" },
    { key: "13", label: "Virtual Reality" },
    { key: "14", label: "Quantum Computing" },
    { key: "15", label: "Hardware" },
    { key: "16", label: "Tutorials" },
    { key: "17", label: "Smart Home" },
    { key: "18", label: "Startups" },
  ];

  return (
    <div className="nav-parent nav-parent-default">
      <div className="nav-container">
        <div className="nav-left">
          <h1>
            <Link href="/">TechFrom10 </Link>
          </h1>
          <ul>
            <Link href="/">Home</Link>
            <li onClick={() => setIsNewsletterOpen(true)}>Newsletter</li>
          </ul>
        </div>
        <div className="nav-right">

          <Dropdown
            menu={{
              items: categories.map((category) => ({
                key: category.key,
                label: (
                  <Link
                    href={`/categories/${category.label
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="dropdown-item"
                  >
                    {category.label}
                  </Link>
                ),
              })),
            }}
            // trigger={["click"]}
            placement="bottom"
          >
            <Button>
              Categories <DownOutlined />
            </Button>
          </Dropdown>

          {/* <Image
            src={msgIcon}
            alt="Get in Touch"
            className="nav-msg"
            width={40}
          />
          <Avatar>
            <AvatarImage src={"https://github.com/shadcn.png"} />
          </Avatar> */}
        </div>
      </div>
      {isNewsletterOpen && (
        <NewsletterPopup
          onClose={() => setIsNewsletterOpen(false)}
          isOpen={isNewsletterOpen}
          setIsNewsletterOpen={setIsNewsletterOpen}
        />
      )}
    </div>
  );
};

export default Header;
