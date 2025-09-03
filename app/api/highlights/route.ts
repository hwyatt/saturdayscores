import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json([], { status: 200 }); // always return array
    }

    const ENDPOINT = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/summary?event=${gameId}`;
    
    try {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error("Failed to fetch from ESPN");

      const json = await res.json();
      const videos = json.videos ?? [];

      if (videos.length === 0) return NextResponse.json([], { status: 200 });

      const sortedVideos = videos.sort((a: any, b: any) => {
        const aDate = new Date(a.originalPublishDate).getTime();
        const bDate = new Date(b.originalPublishDate).getTime();
        return aDate - bDate;
      });

      const hdLinks: string[] = sortedVideos
        .map((video: any) => video.links?.source?.HD?.href)
        .filter((href: string | undefined): href is string => Boolean(href));

      return NextResponse.json(hdLinks, { status: 200 });
    } catch (err) {
      // ESPN fetch failed or gameId is mock → return empty array
      return NextResponse.json([], { status: 200 });
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
