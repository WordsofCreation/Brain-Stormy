import { useEffect } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Layout } from "./components/Layout";
import { BrainstormBoard } from "./views/BrainstormBoard";
import { Calendar } from "./views/Calendar";
import { Contacts } from "./views/Contacts";
import { GoalDashboard } from "./views/GoalDashboard";
import { Home } from "./views/Home";
import { IdeaInbox } from "./views/IdeaInbox";
import { Projects } from "./views/Projects";
import { Tasks } from "./views/Tasks";
import type { ViewId } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useMediaQuery } from "./hooks/useMediaQuery";
import { navigationItems } from "./navigation";

const viewIds = navigationItems.map((item) => item.id) as ViewId[];

function isViewId(value: unknown): value is ViewId {
  return typeof value === "string" && viewIds.includes(value as ViewId);
}

function getViewFromHash() {
  if (typeof window === "undefined") {
    return null;
  }

  const hashView = window.location.hash.replace("#/", "").replace("#", "");
  return isViewId(hashView) ? hashView : null;
}

const viewLabels: Record<ViewId, string> = {
  home: "Home",
  inbox: "Idea Inbox",
  board: "Brainstorm Board",
  projects: "Projects",
  tasks: "Tasks",
  contacts: "Contacts",
  calendar: "Calendar",
  goals: "Goal Dashboard",
};

function renderView(activeView: ViewId, onNavigate: (view: ViewId) => void) {
  switch (activeView) {
    case "home":
      return <Home onNavigate={onNavigate} />;
    case "inbox":
      return <IdeaInbox />;
    case "board":
      return <BrainstormBoard />;
    case "projects":
      return <Projects />;
    case "tasks":
      return <Tasks />;
    case "contacts":
      return <Contacts />;
    case "calendar":
      return <Calendar />;
    case "goals":
      return <GoalDashboard onNavigate={onNavigate} />;
    default:
      return <Home onNavigate={onNavigate} />;
  }
}

export default function App() {
  const [storedActiveView, setStoredActiveView] = useLocalStorage<ViewId>(
    "brain-stormy-active-view",
    "home",
  );
  const isMobile = useMediaQuery("(max-width: 767px)");
  const activeView = isViewId(storedActiveView) ? storedActiveView : "home";

  useEffect(() => {
    const hashView = getViewFromHash();

    if (hashView) {
      setStoredActiveView(hashView);
    } else if (!isViewId(storedActiveView)) {
      setStoredActiveView("home");
    }

    const syncHashRoute = () => {
      const nextView = getViewFromHash();

      if (nextView) {
        setStoredActiveView(nextView);
      }
    };

    window.addEventListener("hashchange", syncHashRoute);
    return () => window.removeEventListener("hashchange", syncHashRoute);
  }, [setStoredActiveView, storedActiveView]);

  const navigate = (view: ViewId) => {
    setStoredActiveView(view);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#/${view}`);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <Layout activeView={activeView} onNavigate={navigate}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={
              isMobile
                ? { opacity: 0, y: 10 }
                : { opacity: 0, y: 18, filter: "blur(8px)" }
            }
            animate={
              isMobile
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0, filter: "blur(0px)" }
            }
            exit={
              isMobile
                ? { opacity: 0, y: -8 }
                : { opacity: 0, y: -12, filter: "blur(8px)" }
            }
            transition={{
              duration: isMobile ? 0.22 : 0.42,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-label={viewLabels[activeView]}
          >
            {renderView(activeView, navigate)}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </MotionConfig>
  );
}
