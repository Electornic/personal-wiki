import { DiscoveryControls } from "@/components/discovery-controls";
import type { DiscoveryState } from "@/lib/wiki/discovery";
import { listAvailableTagsForMyLibrary } from "@/lib/wiki/library";

type MyLibraryDiscoveryControlsProps = {
  discoveryState: DiscoveryState;
  userId: string;
};

export async function MyLibraryDiscoveryControls({
  discoveryState,
  userId,
}: MyLibraryDiscoveryControlsProps) {
  const availableTags = await listAvailableTagsForMyLibrary(userId);

  return (
    <DiscoveryControls
      className="mt-10"
      tagOptions={availableTags}
      query={discoveryState.query}
      sort={discoveryState.sort}
      source={discoveryState.source}
      selectedTags={discoveryState.tags}
    />
  );
}
