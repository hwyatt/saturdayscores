import { NextResponse } from "next/server";

interface VideoLink {
  href?: string;
}

interface VideoLinks {
  source?: {
    HD?: VideoLink;
  };
}

interface Video {
  originalPublishDate: string;
  links?: VideoLinks;
}

interface ESPNApiResponse {
  videos?: Video[];
}

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

      const json: ESPNApiResponse = await res.json();
      const videos = json.videos ?? [];

      if (videos.length === 0) return NextResponse.json([], { status: 200 });

      const sortedVideos = videos.sort((a, b) => {
        const aDate = new Date(a.originalPublishDate).getTime();
        const bDate = new Date(b.originalPublishDate).getTime();
        return aDate - bDate;
      });

      const hdLinks: string[] = sortedVideos
        .map((video) => video.links?.source?.HD?.href)
        .filter((href): href is string => Boolean(href));

      return NextResponse.json(hdLinks, { status: 200 });
    } catch (err) {
      console.error("Failed to fetch ESPN data:", err);
      return NextResponse.json([], { status: 200 });
    }
  } catch (err) {
    console.error("Unhandled error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
