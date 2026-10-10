import { services, site } from "@/data/site";
import { getProjects } from "@/lib/projects";

// llms.txt (https://llmstxt.org): a plain-text summary of the site for AI assistants. Built at deploy time.
export async function GET() {
  const projects = await getProjects();
  const body = `# ${site.fullName}

> ${site.description}

${site.fullName} is a registered private limited company (CIN ${site.legal.cin}) with the ${site.legal.registrar}. Registered office: ${site.address}, India. Directors: ${site.directors.join(", ")}.

## What we do

${services.map((s) => `- ${s.title}: ${s.text}`).join("\n")}

## Pages

- [Home](${site.url}/): Company overview
- [Projects](${site.url}/projects): Commercial, healthcare and religious projects
- [Services](${site.url}/services): Civil construction, infrastructure, design and project management
- [Gallery](${site.url}/gallery): Construction progress and site photography
- [About](${site.url}/about): Company story, vision and timeline
- [Contact](${site.url}/contact): Enquiries and site visits

## Projects

${projects.map((p) => `- [${p.name}](${site.url}/projects/${p.slug}): ${p.category}, ${p.status}, ${p.location}. ${p.tagline}.`).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
