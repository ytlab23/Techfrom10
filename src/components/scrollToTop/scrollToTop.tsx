"use client";
import "./scrollToTop.scss";
import React, { useEffect, useState } from "react";
import { RiArrowUpSFill } from "react-icons/ri";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const handleScroll = () => {
    const scrolled = document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const totalHeight = document.documentElement.scrollHeight;
    const bottomThreshold = totalHeight - windowHeight * 1.1; // 10vh from bottom

    // Show button when scrolled past 1 viewport height AND not near bottom
    const shouldShow = scrolled > windowHeight && scrolled < bottomThreshold;
    setIsVisible(shouldShow);
  };

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <button
      onClick={handleScrollToTop}
      className={`scrollToTop ${isVisible ? "" : "scrollToTop-hidden"}`}
      aria-label="Scroll to top"
    >
      <RiArrowUpSFill size={28} />
    </button>
  );
};

export default ScrollToTop;
