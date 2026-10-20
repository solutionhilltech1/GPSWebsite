import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/data/site";
import { getActiveJobs } from "@/lib/careers";
import CareersClient from "./CareersClient";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${site.fullName}. Open roles for engineers, supervisors and site staff in ${site.offices[0]}.`,
  alternates: { canonical: "/careers" },
};

export default async function CareersPage() {
  const jobs = await getActiveJobs();

  return (
    <>
      <section className="pageHero">
        <div className="media" data-speed="0.3">
          <Image src="/hero-sunset.jpg" alt="" fill priority sizes="100vw" />
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
            projects across Uttar Pradesh.
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

