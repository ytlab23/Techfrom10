import { resend } from "@/lib/resend";
import Newsletter from "@/components/emails/newsletter";
export const GET = async (req: Request) => {
  const data = await resend.emails.send({
    from: "newsletter@techfrom10.com",
    to: "vijayaraghavan1453@gmail.com",
    subject: "Waitlist",
    react: Newsletter(),
  });

  return Response.json(data);
};
