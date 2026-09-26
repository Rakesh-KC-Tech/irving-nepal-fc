import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/announcements/",
          "/documents/",
          "/events/",
          "/membership/",
          "/profile/",
          "/stats/",
          "/teams/",
          "/auth/",
        ],
      },
    ],
    sitemap: "https://portal.irvingnepalfc.com/sitemap.xml",
  };
}
