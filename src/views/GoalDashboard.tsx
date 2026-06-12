import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CalendarClock,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  Gauge,
  Heart,
  Inbox,
  KanbanSquare,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
  TimerReset,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Section } from "../components/Section";
import {
  sampleCalendarItems,
  sampleIdeas,
  sampleProjects,
} from "../data/sampleData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  calendarItemStatuses,
  calendarItemTypes,
  ideaCategories,
  ideaPriorities,
  ideaStatuses,
  projectCategories,
  projectPriorities,
  projectStatuses,
  type CalendarItem,
  type CalendarItemStatus,
  type Idea,
  type IdeaCategory,
  type IdeaPriority,
  type IdeaStatus,
  type Project,
  type ProjectCategory,
  type ProjectPriority,
  type ProjectStatus,
  type ProjectTask,
  type ViewId,
} from "../types";

const ideaStorageKey = "brain-stormy-ideas";
const projectStorageKey = "brain-stormy-projects";
const calendarStorageKey = "brain-stormy-calendar-items";

const priorityWeight: Record<IdeaPriority | ProjectPriority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
};

const priorityStyles: Record<IdeaPriority | ProjectPriority, string> = {
  Low: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  Medium: "border-electric/20 bg-electric/10 text-mint",
  High: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  Urgent: "border-rose-300/25 bg-rose-400/15 text-rose-100",
};

type StoredIdea = Partial<Idea> & {
  note?: string;
  tag?: string;
};

type StoredProject = Partial<Project> & {
  name?: string;
  nextStep?: string;
};

type DashboardTask = ProjectTask & {
  projectId: string;
  projectTitle: string;
  projectPriority: ProjectPriority;
  projectCategory: ProjectCategory;
};

type OverdueItem =
  | {
      id: string;
      title: string;
      date: string;
      priority: ProjectPriority;
      type: "Calendar";
      parent?: string;
    }
  | {
      id: string;
      title: string;
      date: string;
      priority: ProjectPriority;
      type: "Task";
      parent: string;
      projectId: string;
    };

type GoalDashboardProps = {
  onNavigate: (view: ViewId) => void;
};

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateKey(value: string) {
  return new Date(`${value}T00:00:00`);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDate(value?: string) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(parseDateKey(value));
}

function formatTodayTitle(today: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  options: T,
): value is T[number] {
  return typeof value === "string" && options.includes(value);
}

function normalizeIdea(idea: StoredIdea, index: number): Idea {
  const category = isOneOf(idea.category, ideaCategories)
    ? idea.category
    : "Other";
  const status = isOneOf(idea.status, ideaStatuses) ? idea.status : "Raw Idea";
  const priority = isOneOf(idea.priority, ideaPriorities)
    ? idea.priority
    : "Medium";
  const tags =
    Array.isArray(idea.tags) && idea.tags.length > 0
      ? idea.tags
      : idea.tag
        ? [idea.tag]
        : [];

  return {
    id: idea.id || `idea-${index + 1}`,
    title: idea.title?.trim() || `Untitled idea ${index + 1}`,
    description:
      idea.description?.trim() ||
      idea.note?.trim() ||
      "Captured idea waiting for review.",
    category: category as IdeaCategory,
    status: status as IdeaStatus,
    priority: priority as IdeaPriority,
    tags,
    createdAt: idea.createdAt || new Date().toISOString(),
    favorite: Boolean(idea.favorite),
    projectId: idea.projectId || undefined,
  };
}

function normalizeTask(task: Partial<ProjectTask>): ProjectTask {
  return {
    id: task.id || `task-${crypto.randomUUID()}`,
    title: task.title?.trim() || "",
    completed: Boolean(task.completed),
    dueDate: task.dueDate || undefined,
    notes: task.notes?.trim() || undefined,
    stickyNotes: Array.isArray(task.stickyNotes) ? task.stickyNotes : [],
    contactIds: Array.isArray(task.contactIds) ? task.contactIds : [],
  };
}

function normalizeProject(project: StoredProject, index: number): Project {
  const category = isOneOf(project.category, projectCategories)
    ? project.category
    : "Other";
  const status = isOneOf(project.status, projectStatuses)
    ? project.status
    : "Planning";
  const priority = isOneOf(project.priority, projectPriorities)
    ? project.priority
    : "Medium";
  const tasks = Array.isArray(project.tasks)
    ? project.tasks.map(normalizeTask).filter((task) => task.title)
    : [];

  return {
    id: project.id || `project-${index + 1}`,
    title:
      project.title?.trim() ||
      project.name?.trim() ||
      `Untitled project ${index + 1}`,
    description:
      project.description?.trim() ||
      "Structured project that turns an idea into action.",
    category: category as ProjectCategory,
    status: status as ProjectStatus,
    priority: priority as ProjectPriority,
    targetDate: project.targetDate || "",
    ideaIds: Array.isArray(project.ideaIds)
      ? project.ideaIds.filter(Boolean)
      : [],
    tasks,
    createdAt: project.createdAt || new Date().toISOString(),
    notes: project.notes?.trim() || project.nextStep?.trim() || "",
  };
}

function normalizeCalendarItem(
  item: Partial<CalendarItem>,
  index: number,
): CalendarItem {
  const status = isOneOf(item.status, calendarItemStatuses)
    ? item.status
    : "Scheduled";
  const priority = isOneOf(item.priority, projectPriorities)
    ? item.priority
    : "Medium";

  return {
    id: item.id || `calendar-${index + 1}`,
    title: item.title?.trim() || `Scheduled action ${index + 1}`,
    description: item.description?.trim() || "Scheduled action from your plan.",
    date: item.date || toDateKey(new Date()),
    time: item.time || undefined,
    type: isOneOf(item.type, calendarItemTypes) ? item.type : "Other",
    status: status as CalendarItemStatus,
    relatedIdeaId: item.relatedIdeaId || undefined,
    relatedProjectId: item.relatedProjectId || undefined,
    relatedTaskId: item.relatedTaskId || undefined,
    priority: priority as ProjectPriority,
    createdAt: item.createdAt || new Date().toISOString(),
  };
}

function calculateProgress(tasks: ProjectTask[]) {
  if (tasks.length === 0) {
    return 0;
  }

  return Math.round(
    (tasks.filter((task) => task.completed).length / tasks.length) * 100,
  );
}

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(
    motionValue,
    (latest) => `${Math.round(latest).toLocaleString()}${suffix}`,
  );

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [motionValue, value]);

  return <motion.span>{rounded}</motion.span>;
}

function EmptyState({ children }: { children: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-silver/65">
      {children}
    </p>
  );
}

export function GoalDashboard({ onNavigate }: GoalDashboardProps) {
  const [storedIdeas] = useLocalStorage<StoredIdea[]>(
    ideaStorageKey,
    sampleIdeas,
  );
  const [storedProjects, setProjects] = useLocalStorage<StoredProject[]>(
    projectStorageKey,
    sampleProjects,
  );
  const [storedCalendarItems, setCalendarItems] = useLocalStorage<
    Partial<CalendarItem>[]
  >(calendarStorageKey, sampleCalendarItems);

  const today = useMemo(() => new Date(), []);
  const todayKey = toDateKey(today);
  const weekEndKey = toDateKey(addDays(today, 6));
  const weekStartKey = toDateKey(addDays(today, -today.getDay()));

  const ideas = useMemo(
    () => storedIdeas.map((idea, index) => normalizeIdea(idea ?? {}, index)),
    [storedIdeas],
  );
  const projects = useMemo(
    () =>
      storedProjects.map((project, index) =>
        normalizeProject(project ?? {}, index),
      ),
    [storedProjects],
  );
  const calendarItems = useMemo(
    () =>
      storedCalendarItems.map((item, index) =>
        normalizeCalendarItem(item ?? {}, index),
      ),
    [storedCalendarItems],
  );

  const tasks = useMemo<DashboardTask[]>(
    () =>
      projects.flatMap((project) =>
        project.tasks.map((task) => ({
          ...task,
          projectId: project.id,
          projectTitle: project.title,
          projectPriority: project.priority,
          projectCategory: project.category,
        })),
      ),
    [projects],
  );

  const activeProjects = useMemo(
    () =>
      projects
        .filter((project) => project.status !== "Completed")
        .sort(
          (a, b) =>
            priorityWeight[b.priority] - priorityWeight[a.priority] ||
            (a.targetDate || "9999-12-31").localeCompare(
              b.targetDate || "9999-12-31",
            ),
        ),
    [projects],
  );

  const topPriorityIdeas = useMemo(
    () =>
      ideas
        .filter(
          (idea) => idea.status !== "Completed" && idea.status !== "Parked",
        )
        .sort(
          (a, b) =>
            Number(b.favorite) - Number(a.favorite) ||
            priorityWeight[b.priority] - priorityWeight[a.priority] ||
            Date.parse(b.createdAt) - Date.parse(a.createdAt),
        )
        .slice(0, 5),
    [ideas],
  );

  const upcomingCalendarItems = useMemo(
    () =>
      calendarItems
        .filter(
          (item) =>
            item.date >= todayKey &&
            item.date <= weekEndKey &&
            item.status !== "Completed",
        )
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.time ?? "").localeCompare(b.time ?? ""),
        ),
    [calendarItems, todayKey, weekEndKey],
  );

  const todayCalendarItems = upcomingCalendarItems.filter(
    (item) => item.date === todayKey,
  );
  const todayTasks = tasks
    .filter((task) => !task.completed && task.dueDate === todayKey)
    .sort(
      (a, b) =>
        priorityWeight[b.projectPriority] - priorityWeight[a.projectPriority],
    );
  const fallbackFocusTasks = tasks
    .filter(
      (task) => !task.completed && task.dueDate && task.dueDate > todayKey,
    )
    .sort(
      (a, b) =>
        (a.dueDate ?? "").localeCompare(b.dueDate ?? "") ||
        priorityWeight[b.projectPriority] - priorityWeight[a.projectPriority],
    )
    .slice(0, Math.max(0, 4 - todayTasks.length - todayCalendarItems.length));
  const focusTasks = [...todayTasks, ...fallbackFocusTasks].slice(0, 4);

  const overdueItems = useMemo<OverdueItem[]>(() => {
    const overdueCalendar = calendarItems
      .filter((item) => item.date < todayKey && item.status !== "Completed")
      .map((item) => ({
        id: item.id,
        title: item.title,
        date: item.date,
        priority: item.priority,
        type: "Calendar" as const,
        parent: item.type,
      }));
    const overdueTasks = tasks
      .filter(
        (task) => task.dueDate && task.dueDate < todayKey && !task.completed,
      )
      .map((task) => ({
        id: task.id,
        title: task.title,
        date: task.dueDate ?? todayKey,
        priority: task.projectPriority,
        type: "Task" as const,
        parent: task.projectTitle,
        projectId: task.projectId,
      }));

    return [...overdueCalendar, ...overdueTasks].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        priorityWeight[b.priority] - priorityWeight[a.priority],
    );
  }, [calendarItems, tasks, todayKey]);

  const completedThisWeek = useMemo(() => {
    const completedCalendar = calendarItems
      .filter(
        (item) =>
          item.status === "Completed" &&
          item.date >= weekStartKey &&
          item.date <= weekEndKey,
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        context: item.type,
        type: "Calendar",
      }));
    const completedTasks = tasks
      .filter(
        (task) =>
          task.completed &&
          task.dueDate &&
          task.dueDate >= weekStartKey &&
          task.dueDate <= weekEndKey,
      )
      .map((task) => ({
        id: task.id,
        title: task.title,
        context: task.projectTitle,
        type: "Task",
      }));

    return [...completedCalendar, ...completedTasks].slice(0, 6);
  }, [calendarItems, tasks, weekEndKey, weekStartKey]);

  const categoryProgress = useMemo(() => {
    const categories = new Map<string, { total: number; completed: number }>();

    projects.forEach((project) => {
      const current = categories.get(project.category) ?? {
        total: 0,
        completed: 0,
      };
      current.total += Math.max(project.tasks.length, 1);
      current.completed +=
        project.status === "Completed" && project.tasks.length === 0
          ? 1
          : project.tasks.filter((task) => task.completed).length;
      categories.set(project.category, current);
    });

    ideas.forEach((idea) => {
      if (!categories.has(idea.category)) {
        categories.set(idea.category, {
          total: 1,
          completed: idea.status === "Completed" ? 1 : 0,
        });
      }
    });

    return [...categories.entries()]
      .map(([category, value]) => ({
        category,
        total: value.total,
        completed: value.completed,
        progress:
          value.total > 0
            ? Math.round((value.completed / value.total) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total || b.progress - a.progress)
      .slice(0, 6);
  }, [ideas, projects]);

  const projectsNeedingAction = activeProjects
    .filter(
      (project) =>
        project.tasks.some((task) => !task.completed) ||
        project.status === "Waiting",
    )
    .sort(
      (a, b) =>
        priorityWeight[b.priority] - priorityWeight[a.priority] ||
        calculateProgress(a.tasks) - calculateProgress(b.tasks),
    )
    .slice(0, 4);

  const metrics = [
    { label: "Total ideas", value: ideas.length, icon: Lightbulb },
    {
      label: "Favorite ideas",
      value: ideas.filter((idea) => idea.favorite).length,
      icon: Heart,
    },
    {
      label: "Active projects",
      value: projects.filter((project) => project.status !== "Completed")
        .length,
      icon: FolderKanban,
    },
    {
      label: "Completed projects",
      value: projects.filter((project) => project.status === "Completed")
        .length,
      icon: Trophy,
    },
    {
      label: "Scheduled actions",
      value: calendarItems.filter((item) => item.status !== "Completed").length,
      icon: CalendarClock,
    },
    { label: "Overdue actions", value: overdueItems.length, icon: TimerReset },
    {
      label: "Tasks completed",
      value: tasks.filter((task) => task.completed).length,
      icon: CheckCircle2,
    },
    {
      label: "Tasks remaining",
      value: tasks.filter((task) => !task.completed).length,
      icon: ListChecks,
    },
  ];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const executionProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjectCount = projects.filter(
    (project) => project.status !== "Completed",
  ).length;
  const linkedIdeasCount = ideas.filter(
    (idea) =>
      idea.projectId ||
      projects.some((project) => project.ideaIds.includes(idea.id)),
  ).length;
  const shapedIdeaProgress =
    ideas.length > 0 ? Math.round((linkedIdeasCount / ideas.length) * 100) : 0;

  const markTaskComplete = (projectId: string, taskId: string) => {
    setProjects((currentProjects) =>
      currentProjects.map((project) => {
        if (project.id !== projectId || !Array.isArray(project.tasks)) {
          return project;
        }

        return {
          ...project,
          tasks: project.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: true } : task,
          ),
        };
      }),
    );
  };

  const markCalendarComplete = (itemId: string) => {
    setCalendarItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, status: "Completed" } : item,
      ),
    );
  };

  return (
    <Section
      eyebrow="Executive view"
      title="Goal Dashboard"
      description="A calm command center for the ideas, projects, and scheduled actions that need your attention now."
    >
      <div className="grid gap-6">
        <Card
          className="overflow-hidden border-violet/20 bg-storm-radial p-0"
          delay={0.02}
        >
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.8fr] lg:p-7">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-violet">
                <Gauge size={17} /> Big goal summary
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Move from capture to execution with fewer loose ends.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-silver/78 sm:text-base">
                You have {ideas.length} ideas, {activeProjectCount} active
                projects, and {upcomingCalendarItems.length} scheduled actions
                over the next 7 days. The healthiest next move is to protect
                today’s focus list and close overdue loops before adding more
                commitments.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onNavigate("inbox")} type="button">
                  <Inbox className="mr-2" size={17} /> Idea Inbox
                </Button>
                <Button
                  onClick={() => onNavigate("projects")}
                  type="button"
                  variant="secondary"
                >
                  <FolderKanban className="mr-2" size={17} /> Projects
                </Button>
                <Button
                  onClick={() => onNavigate("calendar")}
                  type="button"
                  variant="secondary"
                >
                  <CalendarClock className="mr-2" size={17} /> Calendar
                </Button>
                <Button
                  onClick={() => onNavigate("board")}
                  type="button"
                  variant="ghost"
                >
                  <KanbanSquare className="mr-2" size={17} /> Board
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-navy/55 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-silver/60">Execution progress</p>
                  <p className="mt-2 text-5xl font-semibold text-white">
                    <AnimatedNumber value={executionProgress} suffix="%" />
                  </p>
                </div>
                <Target className="text-violet" size={42} />
              </div>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-electric via-mint to-violet"
                  initial={{ width: 0 }}
                  animate={{ width: `${executionProgress}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/[0.07] p-3">
                  <p className="text-silver/55">Ideas shaped</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    <AnimatedNumber value={shapedIdeaProgress} suffix="%" />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/[0.07] p-3">
                  <p className="text-silver/55">Open loops</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    <AnimatedNumber
                      value={
                        overdueItems.length +
                        tasks.filter((task) => !task.completed).length
                      }
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                className="p-5"
                delay={0.05 + index * 0.04}
                key={metric.label}
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="max-w-24 text-sm leading-5 text-silver/65">
                    {metric.label}
                  </p>
                  <span className="rounded-2xl border border-white/10 bg-white/10 p-2 text-violet">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="mt-5 text-4xl font-semibold tracking-tight text-white">
                  <AnimatedNumber value={metric.value} />
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-violet/25 bg-violet/[0.09]" delay={0.08}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
                  <Sparkles size={17} /> Today’s Focus
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {formatTodayTitle(today)}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-silver">
                {todayCalendarItems.length + focusTasks.length} focus items
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              {todayCalendarItems.slice(0, 4).map((item) => (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-navy/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={item.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.time ? `${item.time} · ` : ""}
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-silver/55">
                      Calendar · {item.type}
                    </p>
                  </div>
                  <Button
                    className="px-4 py-2"
                    onClick={() => markCalendarComplete(item.id)}
                    type="button"
                    variant="secondary"
                  >
                    <Check size={16} className="mr-2" /> Complete
                  </Button>
                </div>
              ))}
              {focusTasks.map((task) => (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-navy/45 p-4 sm:flex-row sm:items-center sm:justify-between"
                  key={`${task.projectId}-${task.id}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-silver/55">
                      Task · {task.projectTitle}
                      {task.dueDate ? ` · ${formatDate(task.dueDate)}` : ""}
                    </p>
                  </div>
                  <Button
                    className="px-4 py-2"
                    onClick={() => markTaskComplete(task.projectId, task.id)}
                    type="button"
                    variant="secondary"
                  >
                    <Check size={16} className="mr-2" /> Complete
                  </Button>
                </div>
              ))}
              {todayCalendarItems.length === 0 && focusTasks.length === 0 ? (
                <EmptyState>
                  No focus actions due today. Choose one project needing action
                  or review a high-priority idea.
                </EmptyState>
              ) : null}
            </div>
          </Card>

          <Card delay={0.12}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <CalendarClock size={17} /> Next 7 Days
            </p>
            <div className="mt-5 grid gap-3">
              {upcomingCalendarItems.slice(0, 7).map((item) => (
                <div
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-3"
                  key={item.id}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-silver/55">
                      {formatDate(item.date)}
                      {item.time ? ` · ${item.time}` : ""}
                    </p>
                  </div>
                  <button
                    className="rounded-full p-2 text-silver transition hover:bg-white/10 hover:text-white"
                    onClick={() => markCalendarComplete(item.id)}
                    type="button"
                    aria-label={`Mark ${item.title} complete`}
                  >
                    <Circle size={18} />
                  </button>
                </div>
              ))}
              {upcomingCalendarItems.length === 0 ? (
                <EmptyState>
                  No calendar actions scheduled in the next 7 days.
                </EmptyState>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card delay={0.14}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <FolderKanban size={17} /> Active projects
            </p>
            <div className="mt-5 grid gap-4">
              {activeProjects.slice(0, 4).map((project) => {
                const progress = calculateProgress(project.tasks);
                return (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    key={project.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {project.title}
                        </p>
                        <p className="mt-1 text-xs text-silver/55">
                          {project.category} · due{" "}
                          {formatDate(project.targetDate)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[project.priority]}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="h-full rounded-full bg-violet"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.9, delay: 0.1 }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-silver/55">
                      {progress}% complete
                    </p>
                  </div>
                );
              })}
              {activeProjects.length === 0 ? (
                <EmptyState>
                  No active projects yet. Promote an approved idea into a
                  project.
                </EmptyState>
              ) : null}
            </div>
          </Card>

          <Card delay={0.18}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <Lightbulb size={17} /> Ideas to Review
            </p>
            <div className="mt-5 grid gap-3">
              {topPriorityIdeas.map((idea) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                  key={idea.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {idea.title}
                    </p>
                    {idea.favorite ? (
                      <Heart
                        className="shrink-0 fill-violet text-violet"
                        size={16}
                      />
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyles[idea.priority]}`}
                    >
                      {idea.priority}
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-silver">
                      {idea.status}
                    </span>
                  </div>
                </div>
              ))}
              {topPriorityIdeas.length === 0 ? (
                <EmptyState>
                  No priority ideas are waiting for review.
                </EmptyState>
              ) : null}
            </div>
          </Card>

          <Card delay={0.22}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <Clock3 size={17} /> Projects Needing Action
            </p>
            <div className="mt-5 grid gap-3">
              {projectsNeedingAction.map((project) => {
                const nextTask = project.tasks.find((task) => !task.completed);
                return (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                    key={project.id}
                  >
                    <p className="text-sm font-semibold text-white">
                      {project.title}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-silver/60">
                      {nextTask
                        ? nextTask.title
                        : project.notes || "Clarify the next action."}
                    </p>
                    <button
                      className="mt-3 inline-flex items-center text-xs font-semibold text-violet transition hover:text-white"
                      onClick={() => onNavigate("projects")}
                      type="button"
                    >
                      Open project <ArrowUpRight className="ml-1" size={14} />
                    </button>
                  </div>
                );
              })}
              {projectsNeedingAction.length === 0 ? (
                <EmptyState>
                  Every active project has a clear next action or no open tasks.
                </EmptyState>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Card delay={0.24}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <TimerReset size={17} /> Overdue items
            </p>
            <div className="mt-5 grid gap-3">
              {overdueItems.slice(0, 6).map((item) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-2xl border border-rose-300/15 bg-rose-400/[0.055] p-3"
                  key={`${item.type}-${item.id}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-silver/55">
                      {item.type} · {formatDate(item.date)}
                      {item.parent ? ` · ${item.parent}` : ""}
                    </p>
                  </div>
                  {item.type === "Task" ? (
                    <button
                      className="rounded-full p-2 text-silver transition hover:bg-white/10 hover:text-white"
                      onClick={() => markTaskComplete(item.projectId, item.id)}
                      type="button"
                      aria-label={`Mark ${item.title} complete`}
                    >
                      <Circle size={18} />
                    </button>
                  ) : (
                    <button
                      className="rounded-full p-2 text-silver transition hover:bg-white/10 hover:text-white"
                      onClick={() => markCalendarComplete(item.id)}
                      type="button"
                      aria-label={`Mark ${item.title} complete`}
                    >
                      <Circle size={18} />
                    </button>
                  )}
                </div>
              ))}
              {overdueItems.length === 0 ? (
                <EmptyState>
                  No overdue actions. Your execution system is clear.
                </EmptyState>
              ) : null}
            </div>
          </Card>

          <Card delay={0.28}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <CheckCircle2 size={17} /> Completed this week
            </p>
            <div className="mt-5 grid gap-3">
              {completedThisWeek.map((item) => (
                <div
                  className="flex items-start gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-3"
                  key={`${item.type}-${item.id}`}
                >
                  <CheckCircle2
                    className="mt-0.5 shrink-0 text-emerald-200"
                    size={17}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-silver/55">
                      {item.type} · {item.context}
                    </p>
                  </div>
                </div>
              ))}
              {completedThisWeek.length === 0 ? (
                <EmptyState>
                  No dated completions this week yet. Complete a focus item to
                  start the list.
                </EmptyState>
              ) : null}
            </div>
          </Card>

          <Card delay={0.32}>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet">
              <BarChart3 size={17} /> Progress by category
            </p>
            <div className="mt-5 grid gap-4">
              {categoryProgress.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-white">
                      {item.category}
                    </span>
                    <span className="text-silver/55">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-electric via-mint to-violet"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
              {categoryProgress.length === 0 ? (
                <EmptyState>
                  Add ideas or projects to see category progress.
                </EmptyState>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
