import { getAdminSupabaseClient, getServerSupabaseClient } from "@/lib/supabase/server";
import { listAuthorDocuments, listPublicDocuments } from "@/lib/wiki/documents";
import type { WikiDocument } from "@/lib/wiki/types";

export type ShelfPlacement = "home" | "topic";

export type CurationShelf = {
  id: string;
  title: string;
  description: string;
  placement: ShelfPlacement;
  topicTag: string | null;
  position: number;
  documents: WikiDocument[];
};

type ShelfRow = {
  id: string;
  title: string;
  description: string;
  placement: ShelfPlacement;
  topic_tag: string | null;
  position: number;
};

type ShelfRecordRow = {
  shelf_id: string;
  record_id: string;
  position: number;
};

function mapShelves(
  shelves: ShelfRow[],
  shelfRecords: ShelfRecordRow[],
  documents: WikiDocument[],
  { includeEmpty = false }: { includeEmpty?: boolean } = {},
) {
  const documentMap = new Map(documents.map((document) => [document.id, document]));

  return shelves
    .map((shelf) => {
      const records = shelfRecords
        .filter((record) => record.shelf_id === shelf.id)
        .sort((left, right) => left.position - right.position)
        .map((record) => documentMap.get(record.record_id))
        .filter((document): document is WikiDocument => Boolean(document));

      return {
        id: shelf.id,
        title: shelf.title,
        description: shelf.description,
        placement: shelf.placement,
        topicTag: shelf.topic_tag,
        position: shelf.position,
        documents: records,
      } satisfies CurationShelf;
    })
    .filter((shelf) => includeEmpty || shelf.documents.length > 0)
    .sort((left, right) => left.position - right.position);
}

export async function listPublicCurationShelves(
  placement: ShelfPlacement,
  topicTag?: string,
) {
  const adminSupabase = getAdminSupabaseClient();

  if (!adminSupabase) {
    return [] as CurationShelf[];
  }

  let shelvesQuery = adminSupabase
    .from("curation_shelves")
    .select("id, title, description, placement, topic_tag, position")
    .eq("placement", placement)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (placement === "topic" && topicTag) {
    shelvesQuery = shelvesQuery.eq("topic_tag", topicTag.trim().toLowerCase());
  }

  const { data: shelves, error: shelvesError } = await shelvesQuery;

  if (shelvesError || !shelves || shelves.length === 0) {
    return [];
  }

  const shelfIds = shelves.map((shelf) => shelf.id);
  const { data: shelfRecords, error: shelfRecordsError } = await adminSupabase
    .from("curation_shelf_records")
    .select("shelf_id, record_id, position")
    .in("shelf_id", shelfIds)
    .order("position", { ascending: true });

  if (shelfRecordsError || !shelfRecords) {
    return [];
  }

  const documents = await listPublicDocuments();
  return mapShelves(shelves as ShelfRow[], shelfRecords as ShelfRecordRow[], documents);
}

export async function listAuthorCurationShelves() {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    return [] as CurationShelf[];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: shelves, error: shelvesError } = await supabase
    .from("curation_shelves")
    .select("id, title, description, placement, topic_tag, position")
    .eq("writer_user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (shelvesError || !shelves || shelves.length === 0) {
    return [];
  }

  const shelfIds = shelves.map((shelf) => shelf.id);
  const { data: shelfRecords, error: shelfRecordsError } = await supabase
    .from("curation_shelf_records")
    .select("shelf_id, record_id, position")
    .in("shelf_id", shelfIds)
    .order("position", { ascending: true });

  if (shelfRecordsError || !shelfRecords) {
    return [];
  }

  const documents = await listAuthorDocuments();
  return mapShelves(shelves as ShelfRow[], shelfRecords as ShelfRecordRow[], documents, {
    includeEmpty: true,
  });
}

type CreateShelfInput = {
  title: string;
  description: string;
  placement: ShelfPlacement;
  topicTag?: string | null;
  recordIds: string[];
};

export async function createCurationShelf(input: CreateShelfInput) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to create a shelf.");
  }

  const title = input.title.trim();
  const description = input.description.trim();
  const placement = input.placement;
  const topicTag =
    placement === "topic" ? input.topicTag?.trim().toLowerCase() ?? null : null;
  const recordIds = [...new Set(input.recordIds.filter(Boolean))];

  if (!title) {
    throw new Error("Shelf title is required.");
  }

  if (recordIds.length === 0) {
    throw new Error("Select at least one record for the shelf.");
  }

  if (placement === "topic" && !topicTag) {
    throw new Error("Topic shelves require a topic tag.");
  }

  const { data: existingShelves } = await supabase
    .from("curation_shelves")
    .select("position")
    .eq("writer_user_id", user.id)
    .order("position", { ascending: false })
    .limit(1);

  const nextPosition = (existingShelves?.[0]?.position ?? -1) + 1;

  const { data: shelf, error: shelfError } = await supabase
    .from("curation_shelves")
    .insert({
      writer_user_id: user.id,
      title,
      description,
      placement,
      topic_tag: topicTag,
      position: nextPosition,
    })
    .select("id")
    .single();

  if (shelfError || !shelf) {
    throw new Error(shelfError?.message ?? "Unable to create curation shelf.");
  }

  const { error: shelfRecordsError } = await supabase
    .from("curation_shelf_records")
    .insert(
      recordIds.map((recordId, index) => ({
        shelf_id: shelf.id,
        record_id: recordId,
        position: index,
      })),
    );

  if (shelfRecordsError) {
    throw new Error(shelfRecordsError.message);
  }
}

export async function deleteCurationShelfById(shelfId: string) {
  const supabase = await getServerSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase server configuration is missing.");
  }

  const { error } = await supabase.from("curation_shelves").delete().eq("id", shelfId);

  if (error) {
    throw new Error(error.message);
  }
}
