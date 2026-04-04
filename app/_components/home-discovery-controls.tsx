import { cacheLife, cacheTag } from "next/cache";

import { DiscoveryControls } from "@/components/discovery-controls";
import { listPublicTagsByPopularity } from "@/entities/record/api/documents";
import type { DiscoveryState } from "@/lib/wiki/discovery";

type HomeDiscoveryControlsProps = {
  discoveryState: DiscoveryState;
};

export async function HomeDiscoveryControls({
  discoveryState,
}: HomeDiscoveryControlsProps) {
  const availableTags = await getCachedHomeDiscoveryTags();

  return (
    <DiscoveryControls
      tagOptions={availableTags}
      query={discoveryState.query}
      sort={discoveryState.sort}
      source={discoveryState.source}
      selectedTags={discoveryState.tags}
    />
  );
}

async function getCachedHomeDiscoveryTags() {
  "use cache";

  cacheLife("hours");
  cacheTag("public-discovery");

  return listPublicTagsByPopularity();
}
