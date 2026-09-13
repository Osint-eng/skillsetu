import {
  CompetencyCode,
  PublicResource,
  RankedResource,
  CompetencyScoreRecord,
} from '../types.ts';
import { SEEDED_PUBLIC_RESOURCES, COMPETENCIES_DATA } from '../data/seedData.ts';
import { db } from '../storage/store.ts';

export interface PublicResourceProvider {
  name: string;
  search(query: string, page?: number, pageSize?: number): Promise<PublicResource[]>;
}

export class OERCommonsProvider implements PublicResourceProvider {
  name = 'OER Commons API';
  private apiUrl: string;
  private apiToken: string | undefined;

  constructor() {
    this.apiUrl = process.env.OER_COMMONS_API_URL || 'https://www.oercommons.org/api/v1';
    this.apiToken = process.env.OER_COMMONS_API_TOKEN;
  }

  async search(query: string, page = 1, pageSize = 20): Promise<PublicResource[]> {
    if (!this.apiToken) {
      // If token not provided in environment, gracefully fall back to local catalogue
      return [];
    }

    try {
      const response = await fetch(`${this.apiUrl}/records/?q=${encodeURIComponent(query)}&page=${page}&limit=${pageSize}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Accept': 'application/json',
          'User-Agent': 'SkillSetu-AI-Applet/1.0',
        },
      });

      if (!response.ok) {
        console.warn(`OER Commons API returned status ${response.status}. Using fallback catalogue.`);
        return [];
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.results)) {
        return [];
      }

      // Normalize OER Commons response to PublicResource schema
      return data.results.map((item: any) => ({
        external_id: `oer-${item.id || item.external_id || Math.random().toString(36).substring(2, 8)}`,
        title: item.title || 'Untitled Open Educational Resource',
        description: item.description || item.summary || 'Open educational resource from OER Commons repository.',
        provider: 'OER Commons (Live API)',
        provider_type: 'oer_commons',
        resource_url: item.url || item.resource_url || 'https://www.oercommons.org',
        resource_type: item.material_type || 'Interactive Module',
        competencies: this.inferCompetencies(item.title + ' ' + (item.description || '')),
        level: this.inferLevel(item.educational_level),
        language: item.language || 'English',
        duration_minutes: item.duration ? parseInt(item.duration, 10) : undefined,
        license_name: item.license?.name || 'Creative Commons',
        license_url: item.license?.url || 'https://creativecommons.org/',
        requires_login: false,
        country_scope: 'Global',
        source_metadata_url: item.url || 'https://www.oercommons.org',
        isFallback: false,
      }));
    } catch (err) {
      console.warn('OER Commons API request error:', err);
      return [];
    }
  }

  private inferCompetencies(text: string): CompetencyCode[] {
    const lower = text.toLowerCase();
    const matches: CompetencyCode[] = [];
    if (lower.includes('stat') || lower.includes('probab') || lower.includes('hypothes')) matches.push(CompetencyCode.STATISTICS);
    if (lower.includes('visua') || lower.includes('chart') || lower.includes('graph') || lower.includes('plot')) matches.push(CompetencyCode.DATA_VISUALIZATION);
    if (lower.includes('clean') || lower.includes('pandas') || lower.includes('wrangl') || lower.includes('tabular')) matches.push(CompetencyCode.DATA_HANDLING);
    if (lower.includes('python') || lower.includes('script') || lower.includes('syntax')) matches.push(CompetencyCode.PYTHON_BASICS);
    if (lower.includes('privacy') || lower.includes('gdpr') || lower.includes('ethic') || lower.includes('secur')) matches.push(CompetencyCode.DATA_PRIVACY);
    return matches.length > 0 ? matches : [CompetencyCode.DATA_HANDLING];
  }

  private inferLevel(levelStr?: string): 'Beginner' | 'Developing' | 'Proficient' | 'Advanced' {
    if (!levelStr) return 'Developing';
    const lower = levelStr.toLowerCase();
    if (lower.includes('intro') || lower.includes('beginn') || lower.includes('primary')) return 'Beginner';
    if (lower.includes('advanc') || lower.includes('graduat')) return 'Advanced';
    if (lower.includes('upper') || lower.includes('profic')) return 'Proficient';
    return 'Developing';
  }
}

export class LocalCatalogueProvider implements PublicResourceProvider {
  name = 'Curated International OER Catalogue (Fallback)';

  async search(query: string): Promise<PublicResource[]> {
    const qLower = query.toLowerCase();
    const words = qLower.split(/\s+/).filter(w => w.length > 2);

    return SEEDED_PUBLIC_RESOURCES.filter(r => {
      const haystack = `${r.title} ${r.description} ${r.competencies.join(' ')} ${r.resource_type}`.toLowerCase();
      if (words.length === 0) return true;
      return words.some(w => haystack.includes(w));
    });
  }
}

export class OpenEdXProvider implements PublicResourceProvider {
  name = 'Open edX Course Catalogue (Connector)';

  async search(): Promise<PublicResource[]> {
    // Modular placeholder interface ready for future campus/org LMS deployments
    return [];
  }
}

export class ResourceRecommendationService {
  private oerProvider: OERCommonsProvider;
  private localProvider: LocalCatalogueProvider;
  private openEdxProvider: OpenEdXProvider;

  constructor() {
    this.oerProvider = new OERCommonsProvider();
    this.localProvider = new LocalCatalogueProvider();
    this.openEdxProvider = new OpenEdXProvider();
  }

  async search(query: string): Promise<{ resources: PublicResource[]; isFallback: boolean; sourceProvider: string }> {
    const queryKey = query.trim().toLowerCase();

    // 1. Check local cache
    const cached = db.getCachedResources(queryKey);
    if (cached) {
      return {
        resources: cached,
        isFallback: cached.some(r => r.isFallback),
        sourceProvider: 'Local Resource Cache (TTL 60m)',
      };
    }

    // 2. Try live OER Commons API
    let liveResults = await this.oerProvider.search(queryKey);
    let isFallback = false;
    let providerName = this.oerProvider.name;

    // 3. Fallback to local catalogue if live results empty
    if (!liveResults || liveResults.length === 0) {
      liveResults = await this.localProvider.search(queryKey);
      isFallback = true;
      providerName = this.localProvider.name;
    }

    // 4. Store in cache
    db.setCachedResources(providerName, queryKey, liveResults, 60);

    return {
      resources: liveResults,
      isFallback,
      sourceProvider: providerName,
    };
  }

  rankResources(
    resources: PublicResource[],
    userScores: Record<CompetencyCode, CompetencyScoreRecord>,
    targetRole = 'Junior Data Analyst',
    preferredLanguage = 'English'
  ): RankedResource[] {
    // Identify top gaps (High gap > Medium gap > Low gap)
    const sortedCompetencies = Object.values(userScores).sort((a, b) => a.score - b.score);
    const topGapCodes = sortedCompetencies.slice(0, 3).map(c => c.competencyCode);
    const primaryGap = sortedCompetencies[0];

    // Remove duplicates by normalized URL or title
    const seen = new Set<string>();
    const uniqueResources = resources.filter(r => {
      const key = `${r.title.toLowerCase()}_${r.resource_url.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const ranked: RankedResource[] = uniqueResources.map(r => {
      // 1. Competency relevance: 45%
      // Higher if resource covers learner's high gap competencies
      let competencyScore = 20;
      const overlapsTopGaps = r.competencies.filter(c => topGapCodes.includes(c));
      if (r.competencies.includes(primaryGap?.competencyCode)) {
        competencyScore = 100;
      } else if (overlapsTopGaps.length > 0) {
        competencyScore = 80;
      } else if (r.competencies.length > 0) {
        competencyScore = 50;
      }

      // 2. Learner-level match: 20%
      let levelScore = 50;
      const learnerLevel = primaryGap ? primaryGap.level : 'Developing';
      if (r.level === learnerLevel) {
        levelScore = 100;
      } else if (
        (learnerLevel === 'Beginner' && r.level === 'Developing') ||
        (learnerLevel === 'Developing' && (r.level === 'Beginner' || r.level === 'Proficient')) ||
        (learnerLevel === 'Proficient' && (r.level === 'Developing' || r.level === 'Advanced'))
      ) {
        levelScore = 75;
      } else {
        levelScore = 40;
      }

      // 3. Target-role relevance: 15%
      let roleScore = 60;
      const descLower = (r.title + ' ' + r.description).toLowerCase();
      if (descLower.includes('analyst') || descLower.includes('analytics') || descLower.includes('data')) {
        roleScore = 100;
      } else if (descLower.includes('python') || descLower.includes('statistics')) {
        roleScore = 85;
      }

      // 4. Metadata quality: 10%
      let metaScore = 60;
      if (r.description && r.description.length > 40) metaScore += 15;
      if (r.license_name) metaScore += 15;
      if (r.duration_minutes) metaScore += 10;
      metaScore = Math.min(100, metaScore);

      // 5. Language match: 10%
      const langScore = r.language.toLowerCase() === preferredLanguage.toLowerCase() ? 100 : 50;

      // Calculate weighted match score:
      // Competency (45%) + Level (20%) + Role (15%) + Metadata (10%) + Language (10%)
      const matchScore = Math.round(
        competencyScore * 0.45 +
        levelScore * 0.20 +
        roleScore * 0.15 +
        metaScore * 0.10 +
        langScore * 0.10
      );

      // Deterministic explanation generator
      const whyRecommended = this.generateWhyRecommended(
        r,
        matchScore,
        primaryGap,
        learnerLevel,
        targetRole
      );

      return {
        ...r,
        matchScore,
        matchBreakdown: {
          competencyRelevance: competencyScore,
          learnerLevelMatch: levelScore,
          targetRoleRelevance: roleScore,
          metadataQuality: metaScore,
          languageMatch: langScore,
        },
        whyRecommended,
      };
    });

    // Sort descending by matchScore
    return ranked.sort((a, b) => b.matchScore - a.matchScore);
  }

  private generateWhyRecommended(
    resource: PublicResource,
    matchScore: number,
    primaryGap?: CompetencyScoreRecord,
    learnerLevel = 'Developing',
    targetRole = 'Junior Data Analyst'
  ): string {
    const primaryName = primaryGap ? COMPETENCIES_DATA[primaryGap.competencyCode].name : 'Data Analysis';
    const coversPrimary = primaryGap && resource.competencies.includes(primaryGap.competencyCode);

    if (coversPrimary && resource.level === learnerLevel) {
      return `Directly targets your primary gap in ${primaryName} with content tailored to your ${learnerLevel} level. Essential for ${targetRole} qualification.`;
    } else if (coversPrimary) {
      return `Strengthens your highest-priority growth area (${primaryName}), bridging from ${learnerLevel} concepts toward practical ${targetRole} workflows.`;
    } else if (matchScore >= 75) {
      return `Reinforces complementary competencies (${resource.competencies.map(c => COMPETENCIES_DATA[c]?.name || c).join(', ')}) required for production data analyst duties.`;
    } else {
      return `Provides supplementary ${resource.resource_type.toLowerCase()} foundations in open international data science curricula.`;
    }
  }

  async getRecommendedForUser(
    userId: string,
    topN = 5
  ): Promise<{ recommendations: RankedResource[]; primaryGap: CompetencyScoreRecord; isFallback: boolean }> {
    const scores = db.getUserScores(userId);
    const sorted = Object.values(scores).sort((a, b) => a.score - b.score);
    const primaryGap = sorted[0];

    // Search queries for primary gap
    const compInfo = COMPETENCIES_DATA[primaryGap.competencyCode];
    const query = compInfo.searchQueries[0];

    const { resources, isFallback } = await this.search(query);
    const ranked = this.rankResources(resources, scores);

    return {
      recommendations: ranked.slice(0, topN),
      primaryGap,
      isFallback,
    };
  }
}

export const resourceService = new ResourceRecommendationService();
