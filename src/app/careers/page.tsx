import type { Metadata } from "next";
import Image from "next/image";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { breadcrumbs, pageMeta } from "@/lib/seo";
import { getActiveJobs } from "@/lib/careers";
import CareersClient from "./CareersClient";

export const metadata: Metadata = pageMeta({
  title: "Careers: Civil Engineer & Construction Jobs in Etah",
  description: `Join ${site.fullName}. Open roles for engineers, supervisors and site staff in ${site.offices[0]}. Apply online.`,
  path: "/careers",
  image: "/opengraph-image.png",
});

// schema.org employmentType values for our job types.
const EMPLOYMENT = { "Full-Time": "FULL_TIME", "Part-Time": "PART_TIME", Contract: "CONTRACTOR", Internship: "INTERN" } as const;

export default async function CareersPage() {
  const jobs = await getActiveJobs();

  return (
    <>
      <JsonLd
        data={{
          "@graph": [
            breadcrumbs([{ name: "Careers", path: "/careers" }]),
            // JobPosting makes open roles eligible for Google Jobs.
            ...jobs.map((j) => ({
              "@type": "JobPosting",
              title: j.title,
              description: [j.description, ...j.responsibilities, ...j.requirements].join(" "),
              datePosted: new Date(j.createdAt).toISOString().slice(0, 10),
              employmentType: EMPLOYMENT[j.type],
              directApply: true,
              hiringOrganization: { "@type": "Organization", name: site.fullName, sameAs: site.url, logo: `${site.url}/logo.png` },
              jobLocation: {
                "@type": "Place",
                address: { "@type": "PostalAddress", addressLocality: j.location, addressRegion: site.postal.region, addressCountry: "IN" },
              },
              industry: "Construction",
              occupationalCategory: j.department,
              url: `${site.url}/careers`,
            })),
          ],
        }}
      />
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src="/hero-sunset.jpg" alt="Construction skyline at sunset" fill priority sizes="100vw" />
        </div>
        <div className="container">
          <span className="eyebrow">Careers</span>
          <h1 className="display h1">
            Build with
            <br />
            <em>GPS Projects</em>
          </h1>
          <p className="lead">
            We are hiring engineers, supervisors and site staff to deliver residential, commercial and industrial
            projects across Uttar Pradesh, Delhi NCR, Uttarakhand &amp; Punjab.
          </p>
        </div>
      </section>

      <section className="section" id="roles">
        <div className="container">
          <CareersClient jobs={jobs} />
        </div>
      </section>
    </>
  );
}

