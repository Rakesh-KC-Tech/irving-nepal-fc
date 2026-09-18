export type SourcePost = {
  externalId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string | null;
  url: string;
};

// Uses the "uploads" playlist (channel id with UC->UU) instead of search.list —
// same data, far cheaper on YouTube's API quota.
export async function fetchLatestYoutubeVideos(
  channelId: string,
  apiKey: string,
  maxResults = 5,
): Promise<SourcePost[]> {
  const uploadsPlaylistId = "UU" + channelId.slice(2);
  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();

  return (data.items ?? []).map(
    (item: {
      snippet: {
        resourceId: { videoId: string };
        title: string;
        description: string;
        publishedAt: string;
        thumbnails?: { high?: { url: string }; default?: { url: string } };
      };
    }) => ({
      externalId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url ?? null,
      url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
    }),
  );
}
