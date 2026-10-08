import { projects, services, site } from "@/data/site";

// llms.txt (https://llmstxt.org): a plain-text summary of the site for AI assistants. Built at deploy time.
export function GET() {
  const body = `# ${site.fullName}

> ${site.description}

${site.fullName} is a registered private limited company (CIN ${site.legal.cin}), incorporated on ${site.legal.incorporated} with the ${site.legal.registrar}. Registered office: ${site.address}, India. Directors: ${site.directors.join(", ")}.

## What we do

${services.map((s) => `- ${s.title}: ${s.text}`).join("\n")}

## Pages

- [Home](${site.url}/): Company overview
- [Projects](${site.url}/projects): All residential and commercial projects
- [Services](${site.url}/services): Civil construction, infrastructure, design and project management
- [Machinery](${site.url}/machinery): Our own construction machinery
- [Gallery](${site.url}/gallery): Construction progress and site photography
- [About](${site.url}/about): Company story, vision and timeline
- [Contact](${site.url}/contact): Enquiries and site visits

## Projects

${projects.map((p) => `- [${p.name}](${site.url}/projects/${p.slug}): ${p.category}, ${p.status}, ${p.location}. ${p.tagline}.`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
