import { ApifyClient } from 'apify-client';

const apify = new ApifyClient({ token: process.env.APIFY_TOKEN });

export async function runTikTokShopActor(
  keywords: string[], webhookUrl: string, userId: string, brandId: string, scrapeRunId: string,
) {
  const run = await apify.actor(process.env.APIFY_TIKTOK_SHOP_ACTOR!).start(
    { keywords, maxItems: 100 },
    {
      webhooks: [{
        eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
        requestUrl: webhookUrl,
        payloadTemplate: JSON.stringify({
          userId, brandId, scrapeRunId, source: 'apify-tiktok-shop',
          runId: '{{resource.id}}', status: '{{eventType}}',
        }),
      }],
    },
  );
  return run.id;
}

export async function runTikTokHashtagActor(
  keywords: string[], webhookUrl: string, userId: string, brandId: string, scrapeRunId: string,
) {
  const hashtags = keywords.map(k => k.replace(/\s+/g, ''));
  const run = await apify.actor(process.env.APIFY_TIKTOK_HASHTAG_ACTOR!).start(
    { hashtags, resultsPerPage: 50 },
    {
      webhooks: [{
        eventTypes: ['ACTOR.RUN.SUCCEEDED', 'ACTOR.RUN.FAILED'],
        requestUrl: webhookUrl,
        payloadTemplate: JSON.stringify({
          userId, brandId, scrapeRunId, source: 'apify-tiktok-hashtag',
          runId: '{{resource.id}}', status: '{{eventType}}',
        }),
      }],
    },
  );
  return run.id;
}

export async function fetchApifyDataset(runId: string) {
  const run = await apify.run(runId).get();
  if (!run?.defaultDatasetId) return [];
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  return items;
}
