import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const bimtekProgress = sqliteTable("bimtek_progress", {
  moduleId: text("module_id").primaryKey(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  progress: real("progress").default(0),
});

export const bimtekLessons = sqliteTable("bimtek_lessons", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const quizScores = sqliteTable("quiz_scores", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  takenAt: integer("taken_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const bookmarks = sqliteTable("bookmarks", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  itemId: text("item_id").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).$defaultFn(() => new Date()),
  metadata: text("metadata"),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const streak = sqliteTable("streak", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: text("last_activity_date"),
  totalDays: integer("total_days").default(0),
});

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  email: text("email"),
  company: text("company"),
  position: text("position"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const favorites = sqliteTable("favorites", {
  id: text("id").primaryKey(),
  moduleId: text("module_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const offlineEvents = sqliteTable("offline_events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructorName: text("instructor_name").notNull(),
  instructorPhone: text("instructor_phone").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  province: text("province").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration").notNull(),
  capacity: integer("capacity").notNull(),
  registered: integer("registered").default(0),
  price: integer("price").notNull(),
  module: text("module").notNull(),
  category: text("category").notNull(),
  status: text("status").default("open"),
  createdAt: text("created_at").notNull(),
});

export const eventParticipants = sqliteTable("event_participants", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  status: text("status").default("registered"),
  registeredAt: text("registered_at").notNull(),
});

export const certificates = sqliteTable("certificates", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  participantId: text("participant_id").notNull(),
  participantName: text("participant_name").notNull(),
  eventTitle: text("event_title").notNull(),
  eventDate: text("event_date").notNull(),
  instructorName: text("instructor_name").notNull(),
  location: text("location").notNull(),
  issuedAt: text("issued_at").notNull(),
});

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});
