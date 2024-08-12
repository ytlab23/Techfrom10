"use client";
import "./Header.scss";
import { NextPage } from "next";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import msgIcon from "@/assets/icons/msg.svg";
import { useEffect } from "react";
interface Props {}

const navList = [
  { name: "Home", path: "/" },
  { name: "Newsletter", path: "/newsletter" },
];
const Header: NextPage<Props> = ({}) => {
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
  return (
    <div className="nav-parent nav-parent-default">
      <div className="nav-container">
        <div className="nav-left">
          <h1>
            <Link href="/">TechFrom10 </Link>
          </h1>
          <ul>
            {navList.map((val, index) => (
              <Link href={val.path} key={index}>
                {val.name}
              </Link>
            ))}
          </ul>
        </div>
        <div className="nav-right">
          <Image
            src={msgIcon}
            alt="Get in Touch"
            className="nav-msg"
            width={40}
          />
          <Avatar>
            <AvatarImage src={"https://github.com/shadcn.png"} />
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default Header;
