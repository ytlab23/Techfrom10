"use client";
import { useState } from "react";
import { NextPage } from "next";
import { useToast } from "../ui/use-toast";

interface Props {
  setIsNewsletterOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubscribeNewsletter: NextPage<Props> = ({ setIsNewsletterOpen }) => {
  const { toast } = useToast();
  const [email, setEmail] = useState<string>("");

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch(
      (process.env.NEXT_PUBLIC_API_BASE_URL as string) + "/api/subscribe",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
    if (res.status === 409) {
      toast({
        title: "Already Subscribed",
        description: "Email ID Already subscribed to Newsletter",
        variant: "destructive",
      });
      setEmail("");
    } else if (res.status === 201) {
      toast({
        title: "Successfully Subscribed",
        description: "Email ID Successfully subscribed to Newsletter",
        variant: "success",
      });
      setEmail("");
      setIsNewsletterOpen(false);
    }
  };

  return (
    <div>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input
          type="text"
          placeholder="Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button>subscribe</button>
      </form>
    </div>
  );
};

export default SubscribeNewsletter;
