import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  fetchFromSocrataApi,
  DatasetMetadata,
  CategoryInfo,
  TagInfo,
  ColumnInfo,
  PortalMetrics,
} from '../utils/api.js';

const DEFAULT_DATA_PORTAL_DOMAIN = 'data.cambridgema.gov';

// Get the default domain from environment, falling back to Cambridge Open Data
const getDefaultDomain = () =>
  process.env.DATA_PORTAL_URL?.replace(/^https?:\/\//, '') || DEFAULT_DATA_PORTAL_DOMAIN;

// Handler for catalog functionality
export async function handleCatalogTool(params: {
  query?: string;
  domain?: string;
  limit?: number;
  offset?: number;
}): Promise<DatasetMetadata[]> {
  const { query, domain = getDefaultDomain(), limit = 10, offset = 0 } = params;

  const apiParams: Record<string, unknown> = {
    limit,
    offset,
    search_context: domain, // Add search_context parameter with the domain
  };

  if (query) {
    apiParams.q = query;
  }

  const baseUrl = `https://${domain}`;
  const response = await fetchFromSocrataApi<{ results: DatasetMetadata[] }>(
    '/api/catalog/v1',
    apiParams,
    baseUrl
  );

  return response.results;
}

// Handler for categories functionality
export async function handleCategoriesTool(params: {
  domain?: string;
}): Promise<CategoryInfo[]> {
  const { domain = getDefaultDomain() } = params;

  const apiParams: Record<string, unknown> = {
    search_context: domain, // Add search_context parameter with the domain
  };

  const baseUrl = `https://${domain}`;

  try {
    // First try the standard domain_categories endpoint
    const response = await fetchFromSocrataApi<CategoryInfo[]>(
      '/api/catalog/v1/domain_categories',
      apiParams,
      baseUrl
    );

    // If we get a valid array response, return it
    if (Array.isArray(response) && response.length > 0) {
      return response;
    }

    // Otherwise, try the alternate approach with only=categories parameter
    const altResponse = await fetchFromSocrataApi<{ categories: CategoryInfo[] }>(
      '/api/catalog/v1',
      { ...apiParams, only: 'categories' },
      baseUrl
    );

    return altResponse.categories || [];
  } catch (error) {
    // If the primary endpoint fails, try the alternate approach
    try {
      const altResponse = await fetchFromSocrataApi<{ categories: CategoryInfo[] }>(
        '/api/catalog/v1',
        { ...apiParams, only: 'categories' },
        baseUrl
      );

      return altResponse.categories || [];
    } catch {
      // If both approaches fail, rethrow the original error
      throw error;
    }
  }
}

// Handler for tags functionality
export async function handleTagsTool(params: {
  domain?: string;
}): Promise<TagInfo[]> {
  const { domain = getDefaultDomain() } = params;

  const apiParams: Record<string, unknown> = {
    search_context: domain, // Add search_context parameter with the domain
  };

  const baseUrl = `https://${domain}`;

  try {
    // First try the standard domain_tags endpoint
    const response = await fetchFromSocrataApi<TagInfo[]>(
      '/api/catalog/v1/domain_tags',
      apiParams,
      baseUrl
    );

    // If we get a valid array response, return it
    if (Array.isArray(response) && response.length > 0) {
      return response;
    }

    // Otherwise, try the alternate approach with only=tags parameter
    const altResponse = await fetchFromSocrataApi<{ tags: TagInfo[] }>(
      '/api/catalog/v1',
      { ...apiParams, only: 'tags' },
      baseUrl
    );

    return altResponse.tags || [];
  } catch (error) {
    // If the primary endpoint fails, try the alternate approach
    try {
      const altResponse = await fetchFromSocrataApi<{ tags: TagInfo[] }>(
        '/api/catalog/v1',
        { ...apiParams, only: 'tags' },
        baseUrl
      );

      return altResponse.tags || [];
    } catch {
      // If both approaches fail, rethrow the original error
      throw error;
    }
  }
}

// Handler for dataset metadata functionality
export async function handleDatasetMetadataTool(params: {
  datasetId: string;
  domain?: string;
}): Promise<Record<string, unknown>> {
  const { datasetId, domain = getDefaultDomain() } = params;

  const baseUrl = `https://${domain}`;
  const response = await fetchFromSocrataApi<Record<string, unknown>>(
    `/api/views/${datasetId}`,
    {},
    baseUrl
  );

  return response;
}

// Handler for column information functionality
export async function handleColumnInfoTool(params: {
  datasetId: string;
  domain?: string;
}): Promise<ColumnInfo[]> {
  const { datasetId, domain = getDefaultDomain() } = params;

  const baseUrl = `https://${domain}`;
  const response = await fetchFromSocrataApi<ColumnInfo[]>(
    `/api/views/${datasetId}/columns`,
    {},
    baseUrl
  );

  return response;
}

// Handler for data access functionality
export async function handleDataAccessTool(params: {
  datasetId: string;
  domain?: string;
  query?: string;
  limit?: number;
  offset?: number;
  select?: string;
  where?: string;
  order?: string;
  group?: string;
  having?: string;
  q?: string;
}): Promise<Record<string, unknown>[]> {
  const {
    datasetId,
    domain = getDefaultDomain(),
    query,
    limit = 10,
    offset = 0,
    select,
    where,
    order,
    group,
    having,
    q,
  } = params;

  const apiParams: Record<string, unknown> = {
    $limit: limit,
    $offset: offset,
  };

  // Handle comprehensive query parameter if provided
  if (query) {
    apiParams.$query = query;
  } else {
    // Otherwise handle individual SoQL parameters
    if (select) apiParams.$select = select;
    if (where) apiParams.$where = where;
    if (order) apiParams.$order = order;
    if (group) apiParams.$group = group;
    if (having) apiParams.$having = having;
    if (q) apiParams.$q = q;
  }

  const baseUrl = `https://${domain}`;
  const response = await fetchFromSocrataApi<Record<string, unknown>[]>(
    `/resource/${datasetId}.json`,
    apiParams,
    baseUrl
  );

  return response;
}

// Handler for site metrics functionality
export async function handleSiteMetricsTool(params: {
  domain?: string;
}): Promise<PortalMetrics> {
  const { domain = getDefaultDomain() } = params;

  const baseUrl = `https://${domain}`;
  const response = await fetchFromSocrataApi<PortalMetrics>(
    '/api/site_metrics.json',
    {},
    baseUrl
  );

  return response;
}

// Consolidated Socrata tool
export const UNIFIED_SOCRATA_TOOL: Tool = {
  name: 'get_data',
  description: 'Access data and metadata to learn more about the city and its underlying information.',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['catalog', 'categories', 'tags', 'dataset-metadata', 'column-info', 'data-access', 'site-metrics'],
        description:
          'The type of operation to perform:' +
          '\n- catalog: List datasets with optional search' +
          '\n- categories: List all dataset categories' +
          '\n- tags: List all dataset tags' +
          '\n- dataset-metadata: Get detailed metadata for a specific dataset' +
          '\n- column-info: Get column details for a specific dataset' +
          '\n- data-access: Access records from a dataset (with query support)' +
          '\n- site-metrics: Get portal-wide statistics',
      },
      domain: {
        type: 'string',
        description: 'Optional domain (hostname only, without protocol). Used with all operation types.',
      },
      query: {
        type: 'string',
        description:
          'Search or query string with different uses depending on operation type:' +
          '\n- For type=catalog: Search query to filter datasets' +
          '\n- For type=data-access: SoQL query string for complex data filtering',
      },
      datasetId: {
        type: 'string',
        description:
          'Dataset identifier required for the following operations:' +
          '\n- For type=dataset-metadata: Get dataset details' +
          '\n- For type=column-info: Get column information' +
          '\n- For type=data-access: Specify which dataset to query (e.g., 6zsd-86xi)',
      },
      soqlQuery: {
        type: 'string',
        description:
          'DEPRECATED: Use query instead. For type=data-access only. Optional SoQL query string for filtering data.',
        deprecated: true,
      },
      limit: {
        type: 'number',
        description:
          'Maximum number of results to return:' +
          '\n- For type=catalog: Limits dataset results' +
          '\n- For type=data-access: Limits data records returned',
        default: 10,
      },
      offset: {
        type: 'number',
        description:
          'Number of results to skip for pagination:' +
          '\n- For type=catalog: Skips dataset results' +
          '\n- For type=data-access: Skips data records for pagination',
        default: 0,
      },
      select: {
        type: 'string',
        description: 'For type=data-access only. Specifies which columns to return in the result set.',
      },
      where: {
        type: 'string',
        description: 'For type=data-access only. Filters the rows to be returned (e.g., "magnitude > 3.0").',
      },
      order: {
        type: 'string',
        description: 'For type=data-access only. Orders the results based on specified columns (e.g., "date DESC").',
      },
      group: {
        type: 'string',
        description: 'For type=data-access only. Groups results for aggregate functions.',
      },
      having: {
        type: 'string',
        description: 'For type=data-access only. Filters for grouped results, similar to where but for grouped data.',
      },
      q: {
        type: 'string',
        description: 'For type=data-access only. Full text search parameter for free-text searching across the dataset.',
      },
    },
    required: ['type'],
    additionalProperties: false,
  },
};

export const SOCRATA_TOOLS: Tool[] = [UNIFIED_SOCRATA_TOOL];

// Function to handle all Socrata tool calls
export async function handleSocrataTool(params: Record<string, unknown>): Promise<unknown> {
  const type = params.type as string;

  switch (type) {
    case 'catalog':
      return handleCatalogTool({
        query: params.query as string,
        domain: params.domain as string,
        limit: params.limit as number,
        offset: params.offset as number,
      });

    case 'categories':
      return handleCategoriesTool({
        domain: params.domain as string,
      });

    case 'tags':
      return handleTagsTool({
        domain: params.domain as string,
      });

    case 'dataset-metadata':
      if (!params.datasetId) {
        throw new Error('datasetId is required for dataset-metadata operation');
      }
      return handleDatasetMetadataTool({
        datasetId: params.datasetId as string,
        domain: params.domain as string,
      });

    case 'column-info':
      if (!params.datasetId) {
        throw new Error('datasetId is required for column-info operation');
      }
      return handleColumnInfoTool({
        datasetId: params.datasetId as string,
        domain: params.domain as string,
      });

    case 'data-access': {
      if (!params.datasetId) {
        throw new Error('datasetId is required for data-access operation');
      }

      // Handle backward compatibility with soqlQuery parameter
      const query = (params.query || params.soqlQuery) as string;

      return handleDataAccessTool({
        datasetId: params.datasetId as string,
        domain: params.domain as string,
        query,
        limit: params.limit as number,
        offset: params.offset as number,
        select: params.select as string,
        where: params.where as string,
        order: params.order as string,
        group: params.group as string,
        having: params.having as string,
        q: params.q as string,
      });
    }

    case 'site-metrics':
      return handleSiteMetricsTool({
        domain: params.domain as string,
      });

    default:
      throw new Error(`Unknown operation type: ${type}`);
  }
}
