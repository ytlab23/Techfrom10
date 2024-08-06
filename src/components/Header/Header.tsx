import "./Header.scss";
import { NextPage } from "next";
import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import msgIcon from "@/assets/icons/msg.svg";
interface Props {}

const navList = [
  { name: "Home", path: "/" },
  { name: "Newsletter", path: "/newsletter" },
];
const Header: NextPage<Props> = ({}) => {
  return (
    <div className="nav-parent">
      <div className="nav-container">
        <div className="nav-left">
          <h1>TechFrom10</h1>
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
