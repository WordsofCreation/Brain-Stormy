import {
  CalendarDays,
  FolderKanban,
  Goal,
  Home,
  Lightbulb,
  ListTodo,
  PanelTop,
  UsersRound,
} from "lucide-react";
import type { NavigationItem } from "./types";

export const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "inbox", label: "Ideas", icon: Lightbulb },
  { id: "board", label: "Board", icon: PanelTop },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "contacts", label: "Contacts", icon: UsersRound },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "goals", label: "Dashboard", icon: Goal },
];
