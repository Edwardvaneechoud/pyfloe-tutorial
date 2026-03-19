// Static endpoint — generates /search-index.json at build time

// @ts-ignore
import introductionHtml from '../content/introduction.html?raw';
// @ts-ignore
import module1Html from '../content/module-1.html?raw';
// @ts-ignore
import module2Html from '../content/module-2.html?raw';
// @ts-ignore
import module3Html from '../content/module-3.html?raw';
// @ts-ignore
import module4Html from '../content/module-4.html?raw';
// @ts-ignore
import module5Html from '../content/module-5.html?raw';
// @ts-ignore
import interludeWiringHtml from '../content/interlude-wiring.html?raw';
// @ts-ignore
import interludeWhyHtml from '../content/interlude-why.html?raw';
// @ts-ignore
import deepDiveStreamingHtml from '../content/deep-dive-streaming.html?raw';
// @ts-ignore
import epilogueHtml from '../content/epilogue.html?raw';

interface Section {
  heading: string;
  text: string;
}

interface PageEntry {
  slug: string;
  title: string;
  sections: Section[];
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<pre[\s\S]*?<\/pre>/gi, '')   // skip code blocks
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSections(html: string): Section[] {
  const sections: Section[] = [];
  // Split by h2/h3 headings
  const parts = html.split(/(?=<h[23][^>]*>)/i);

  for (const part of parts) {
    const headingMatch = part.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
    const heading = headingMatch ? stripTags(headingMatch[1]) : '';
    const text = stripTags(part);
    if (text.length > 20) {
      sections.push({
        heading: heading || '(intro)',
        text: text.substring(0, 500),
      });
    }
  }
  return sections;
}

const pages: { slug: string; title: string; html: string }[] = [
  { slug: 'introduction', title: 'Introduction: Meet pyfloe', html: introductionHtml },
  { slug: 'module-1', title: 'Module 1: The Context & Foundation', html: module1Html },
  { slug: 'module-2', title: 'Module 2: Python Magic & Dunder Methods', html: module2Html },
  { slug: 'module-3', title: 'Module 3: The Engine Room', html: module3Html },
  { slug: 'module-4', title: 'Module 4: Advanced Algorithms', html: module4Html },
  { slug: 'module-5', title: 'Module 5: Query Optimizer', html: module5Html },
  { slug: 'interlude-wiring', title: 'Interlude: Wiring It Together', html: interludeWiringHtml },
  { slug: 'interlude-why', title: 'Interlude: Why This Matters', html: interludeWhyHtml },
  { slug: 'deep-dive-streaming', title: 'Deep Dive: Streaming I/O', html: deepDiveStreamingHtml },
  { slug: 'epilogue', title: 'Epilogue: Where Do You Go From Here?', html: epilogueHtml },
];

const index: PageEntry[] = pages.map(p => ({
  slug: p.slug,
  title: p.title,
  sections: extractSections(p.html),
}));

export function GET() {
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
}
