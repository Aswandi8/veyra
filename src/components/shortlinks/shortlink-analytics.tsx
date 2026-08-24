import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";

import type {
  ShortLinkAnalyticsItem,
  ShortLinkDetailAnalytics,
  ShortLinkGlobalAnalytics,
} from "@/lib/shortlinks/types";

function StatisticCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-5">
        <TypographyMuted>{label}</TypographyMuted>
        <TypographyH3 className="mt-1">{value.toLocaleString()}</TypographyH3>
      </CardContent>
    </Card>
  );
}

function RankedList({
  title,
  items,
}: {
  title: string;
  items: ShortLinkAnalyticsItem[];
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={`${item.value ?? "unknown"}-${index}`}
                className="flex items-center justify-between gap-4"
              >
                <TypographyP className="min-w-0 truncate">
                  {item.value || "Unknown"}
                </TypographyP>

                <span className="shrink-0 font-medium tabular-nums">
                  {item.clicks.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <TypographyMuted>No analytics data yet.</TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}

function ClicksByDay({
  data,
}: {
  data: Array<{ date: string; clicks: number }>;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Clicks by day</CardTitle>
      </CardHeader>

      <CardContent>
        {data.some((item) => item.clicks > 0) ? (
          <div className="max-h-80 space-y-3 overflow-auto">
            {data.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between gap-4"
              >
                <TypographyMuted>{item.date}</TypographyMuted>

                <span className="font-medium tabular-nums">
                  {item.clicks.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <TypographyMuted>No click events recorded yet.</TypographyMuted>
        )}
      </CardContent>
    </Card>
  );
}

export function GlobalShortLinkAnalytics({
  analytics,
}: {
  analytics: ShortLinkGlobalAnalytics;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatisticCard
          label="ShortLinks"
          value={analytics.summary.totalShortLinks}
        />
        <StatisticCard
          label="Active"
          value={analytics.summary.activeShortLinks}
        />
        <StatisticCard
          label="Total Clicks"
          value={analytics.summary.totalClicks}
        />
        <StatisticCard
          label={`${analytics.range.days} Day Clicks`}
          value={analytics.summary.rangeClicks}
        />
        <StatisticCard
          label="Unique Visitors"
          value={analytics.summary.uniqueVisitors}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ClicksByDay data={analytics.clicksByDay} />

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Top ShortLinks</CardTitle>
          </CardHeader>

          <CardContent>
            {analytics.topLinks.length > 0 ? (
              <div className="space-y-4">
                {analytics.topLinks.map((shortLink) => (
                  <div key={shortLink.id}>
                    <div className="flex items-center justify-between gap-4">
                      <Link
                        href={`/shortlinks/${shortLink.id}`}
                        className="min-w-0 truncate font-medium hover:underline"
                      >
                        /{shortLink.slug}
                      </Link>

                      <span className="shrink-0 font-medium tabular-nums">
                        {shortLink.clickCount.toLocaleString()}
                      </span>
                    </div>

                    <TypographyMuted className="mt-1 truncate">
                      {shortLink.title || shortLink.destinationUrl}
                    </TypographyMuted>

                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <TypographyMuted>No shortlinks yet.</TypographyMuted>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <RankedList title="Referrers" items={analytics.topReferrers} />
        <RankedList title="Countries" items={analytics.topCountries} />
        <RankedList title="Devices" items={analytics.topDevices} />
        <RankedList title="Browsers" items={analytics.topBrowsers} />
        <RankedList
          title="Operating Systems"
          items={analytics.topOperatingSystems}
        />
      </div>
    </div>
  );
}

export function DetailShortLinkAnalytics({
  analytics,
}: {
  analytics: ShortLinkDetailAnalytics;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard
          label="Total Clicks"
          value={analytics.summary.totalClicks}
        />
        <StatisticCard label="Today" value={analytics.summary.todayClicks} />
        <StatisticCard
          label={`${analytics.range.days} Day Clicks`}
          value={analytics.summary.rangeClicks}
        />
        <StatisticCard
          label="Unique Visitors"
          value={analytics.summary.uniqueVisitors}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatisticCard label="Human" value={analytics.visitorTypes.HUMAN} />
        <StatisticCard label="Crawler" value={analytics.visitorTypes.CRAWLER} />
        <StatisticCard label="Bot" value={analytics.visitorTypes.BOT} />
        <StatisticCard label="Unknown" value={analytics.visitorTypes.UNKNOWN} />
      </div>

      <ClicksByDay data={analytics.clicksByDay} />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <RankedList title="Referrers" items={analytics.topReferrers} />
        <RankedList title="Countries" items={analytics.topCountries} />
        <RankedList title="Devices" items={analytics.topDevices} />
        <RankedList title="Browsers" items={analytics.topBrowsers} />
        <RankedList
          title="Operating Systems"
          items={analytics.topOperatingSystems}
        />
      </div>
    </div>
  );
}
