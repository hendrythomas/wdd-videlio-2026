import { decodeHtml, stripHtml } from './decodeHtml';

const slugToSection = {
  'viplab': 'viplab',
  'innovatie': 'viplab',
  'fysieke-toegankelijkheid': 'toegankelijkheid',
  'persoonlijke-groei': 'groei',
  'workshop': 'groei',
  'community': 'gemeenschap',
  'bijeenkomst': 'gemeenschap',
  'werkgroep': 'gemeenschap',
};

export async function fetchCategoryContent() {
  const bySection = {
    viplab: { activities: [], articles: [] },
    toegankelijkheid: { activities: [], articles: [] },
    groei: { activities: [], articles: [] },
    gemeenschap: { activities: [], articles: [] },
  };

  try {
    const res = await fetch(
      'http://dev1.videlio.nl/wp-json/wp/v2/activities?per_page=100&_embed=true&acf_format=standard'
    );
    const activities = await res.json();

    for (const activity of activities) {
      const terms = (activity._embedded?.['acf:term'] ?? [])
        .filter(t => t.taxonomy === 'activity_type');

      const sections = new Set();
      for (const term of terms) {
        const section = slugToSection[term.slug];
        if (section) sections.add(section);
      }

      const [day, month, year] = (activity.acf?.start_date ?? '').split('/');
      const startDate = day ? `${year}-${month}-${day}T${activity.acf?.start_time || '00:00'}` : null;

      const img = activity.acf?.image;

      const eventData = {
        id: activity.id,
        slug: activity.slug,
        title: decodeHtml(activity.title.rendered),
        summary: stripHtml(activity.acf?.summary ?? ''),
        longDescription: activity.acf?.long_description ? decodeHtml(activity.acf.long_description) : null,
        startDate,
        endTime: activity.acf?.end_time || null,
        image: img && typeof img === 'string' ? { url: img, alt: activity.acf?.image_alt ?? null } : null,
        types: terms.map(t => decodeHtml(t.name)),
      };

      for (const section of sections) {
        bySection[section].activities.push(eventData);
      }
    }
  } catch (e) {
    console.warn('WordPress activiteiten niet bereikbaar', e);
  }

  try {
    const res = await fetch(
      'http://dev1.videlio.nl/wp-json/wp/v2/posts?per_page=100&_embed=true'
    );
    const posts = await res.json();

    for (const post of posts) {
      const categories = post._embedded?.['wp:term']?.[0] ?? [];
      const sections = new Set();
      for (const cat of categories) {
        const section = slugToSection[cat.slug];
        if (section) sections.add(section);
      }

      const articleData = {
        id: post.id,
        slug: post.slug,
        title: decodeHtml(post.title.rendered),
        summary: stripHtml(post.excerpt.rendered),
        date: post.date,
        image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null,
      };

      for (const section of sections) {
        bySection[section].articles.push(articleData);
      }
    }
  } catch (e) {
    console.warn('WordPress posts niet bereikbaar', e);
  }

  return bySection;
}

export const sectionMeta = {
  viplab: { title: 'VIP Lab', href: '/meedoen/viplab' },
  toegankelijkheid: { title: 'Fysieke toegankelijkheid', href: '/meedoen/toegankelijkheid' },
  groei: { title: 'Persoonlijke groei', href: '/meedoen/groei' },
  gemeenschap: { title: 'Videlio Community', href: '/meedoen/community' },
};
