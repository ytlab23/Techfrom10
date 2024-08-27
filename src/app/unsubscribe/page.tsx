"use client";
import "./unsubscribe.scss";
import { NextPage } from "next";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function unsubscribeEmail(e: React.FormEvent) {
    e.preventDefault();

    const data = await fetch(
      process.env.NEXT_PUBLIC_API_BASE_URL + "/api/subscribe",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, unsubscribe: true }),
      }
    );

    if (data.status === 200) {
      toast({
        title: "Unsubscription successful",
        description: "You won't receive any future emails from us.",
        variant: "success",
      });
      setSubmitted(true);
      setEmail("");
    } else {
      toast({
        title: "You are not subscribed",
        description: "The email ID provided is not in our database.",
        variant: "destructive",
      });
      setEmail("");
    }
  }

  return (
    <div className="unsubscribe-parent">
      <div className="unsubscribe-container">
        <div className="unsubscribe-header">
          <h1>Unsubscribe</h1>
        </div>
        <form onSubmit={unsubscribeEmail}>
          <input
            type="text"
            name="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
        {submitted && (
          <div className="unsubscribe-message">
            <p>
              Unsubscription successful. You won't receive any future emails
              from us.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
