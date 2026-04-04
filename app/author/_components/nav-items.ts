export type NavItem = {
  href: string;
  label: string;
  iconName: "documents" | "chat" | "write" | "library";
  exact?: boolean;
};

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { href: "/author", label: "Documents", iconName: "documents", exact: true },
  { href: "/author/chat", label: "Chat", iconName: "chat" },
  { href: "/author/documents/new", label: "New Record", iconName: "write" },
  { href: "/me/library", label: "My Library", iconName: "library" },
];
