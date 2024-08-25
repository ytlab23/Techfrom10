import {
  Button,
  Html,
  Head,
  Heading,
  Body,
  Section,
  Img,
  Text,
  Column,
  Link,
  Row,
} from "@react-email/components";

const fetchData = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/fetchRoundup`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return data;
};

export default async function Newsletter() {
  const data = await fetchData();
  return (
    <Html>
      <Head />
      <Body>
        <Section
          style={{
            paddingTop: 40,
            paddingBottom: 40,
            paddingLeft: 32,
            paddingRight: 32,
          }}
        >
          <Row>
            <Column style={{ width: "80%" }}>
              <Img
                alt="React Email logo"
                height="42"
                src="https://utfs.io/f/751344c9-4fdb-4ed6-ba8b-8400177461bf-huyukr.png"
              />
            </Column>
            <Column align="right">
              <Row align="right">
                <Column>
                  <Link href="#">
                    <Img
                      alt="X"
                      height="36"
                      src="https://utfs.io/f/1c2e5232-5855-453c-8751-5284988943b4-dgzcio.png"
                      style={{
                        marginLeft: 4,
                        marginRight: 4,
                      }}
                      width="36"
                    />
                  </Link>
                </Column>
                <Column>
                  <Link href="#">
                    <Img
                      alt="Instagram"
                      height="36"
                      src="https://utfs.io/f/6edcd40a-f43d-4690-a8c7-a1d7c24946c7-lpkn3a.png"
                      style={{
                        marginLeft: 4,
                        marginRight: 4,
                      }}
                      width="36"
                    />
                  </Link>
                </Column>
                <Column>
                  <Link href="#">
                    <Img
                      alt="Facebook"
                      height="36"
                      src="https://utfs.io/f/d27321b6-d47e-47b3-b19a-2fea2ad2885a-q1hzrm.png"
                      style={{ marginLeft: 4, marginRight: 4 }}
                      width="36"
                    />
                  </Link>
                </Column>
              </Row>
            </Column>
          </Row>
        </Section>
        {data.slice(-3).map((element: any, index: number) => (
          <Section
            style={{ marginTop: "16px", marginBottom: "30px", width: "80%" }}
            key={element._id}
          >
            <Section
              align="left"
              style={{
                display: "inline-block",
                textAlign: "left",
                width: "100%",
                maxWidth: "250px",
                verticalAlign: "top",
              }}
            >
              <Text
                style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: "24px",
                  fontWeight: 600,
                  color: "rgb(79,70,229)",
                }}
              >
                Top Roundup's from this week
              </Text>
              <Text
                style={{
                  margin: 0,
                  marginTop: "8px",
                  fontSize: 26,
                  lineHeight: "28px",
                  fontWeight: 600,
                  color: "rgb(17,24,39)",
                }}
              >
                {element.title}
              </Text>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "rgb(107,114,128)",
                }}
              >
                {element.headlines[index]}
              </Text>
              <Link
                href={
                  process.env.NEXT_PUBLIC_API_BASE_URL +
                  "/article/" +
                  element._id
                }
                style={{
                  color: "rgb(79 70 229)",
                  textDecorationLine: "underline",
                }}
              >
                Read more
              </Link>
            </Section>

            {/* //image Section */}

            <Section
              align="right"
              style={{
                display: "inline-block",
                marginTop: 8,
                marginBottom: 8,
                width: "100%",
                maxWidth: 220,
                verticalAlign: "top",
              }}
            >
              <Img
                alt="An aesthetic picture taken of an Iphone, flowers, glasses and a card that reads 'Gucci, bloom' coming out of a leathered bag with a ziper"
                height={220}
                src={element.imgUrl}
                style={{
                  borderRadius: 8,
                  objectFit: "cover",
                }}
                width={220}
              />
            </Section>
          </Section>
        ))}
        <Section style={{ textAlign: "center" }}>
          <table style={{ width: "100%" }}>
            <tr style={{ width: "100%" }}>
              <td align="center">
                <Img
                  alt="React Email logo"
                  height="42"
                  src="https://utfs.io/f/751344c9-4fdb-4ed6-ba8b-8400177461bf-huyukr.png"
                />
              </td>
            </tr>
            <tr style={{ width: "100%" }}>
              <td align="center">
                <Text
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    fontSize: 16,
                    lineHeight: "24px",
                    fontWeight: 600,
                    color: "rgb(17,24,39)",
                  }}
                >
                  Techfrom10
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                    fontSize: 16,
                    lineHeight: "24px",
                    color: "rgb(107,114,128)",
                  }}
                >
                  Your Tech Roundup!
                </Text>
              </td>
            </tr>
            <tr>
              <td align="center">
                <Row
                  style={{
                    display: "table-cell",
                    height: 44,
                    width: 56,
                    verticalAlign: "bottom",
                  }}
                >
                  <Column style={{ paddingRight: 8 }}>
                    <Link href="#">
                      <Img
                        alt="Facebook"
                        height="36"
                        src="https://utfs.io/f/d27321b6-d47e-47b3-b19a-2fea2ad2885a-q1hzrm.png"
                        width="36"
                      />
                    </Link>
                  </Column>
                  <Column style={{ paddingRight: 8 }}>
                    <Link href="#">
                      <Img
                        alt="X"
                        height="36"
                        src="https://utfs.io/f/1c2e5232-5855-453c-8751-5284988943b4-dgzcio.png"
                        width="36"
                      />
                    </Link>
                  </Column>
                  <Column>
                    <Link href="#">
                      <Img
                        alt="Instagram"
                        height="36"
                        src="https://utfs.io/f/6edcd40a-f43d-4690-a8c7-a1d7c24946c7-lpkn3a.png"
                        width="36"
                      />
                    </Link>
                  </Column>
                </Row>
              </td>
            </tr>
            <tr>
              <td align="center">
                <Text
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    fontSize: 16,
                    lineHeight: "24px",
                    fontWeight: 600,
                    color: "rgb(17,24,39)",
                  }}
                >
                  123 Main Street Anytown, CA 12345
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    marginBottom: 0,
                    fontSize: 16,
                    lineHeight: "24px",
                    color: "rgb(107,114,128)",
                  }}
                >
                  mail@example.com +123456789
                </Text>
              </td>
            </tr>
          </table>
        </Section>
      </Body>
    </Html>
  );
}
