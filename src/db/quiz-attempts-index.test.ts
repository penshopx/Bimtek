import { expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { getTableConfig } from "drizzle-orm/sqlite-core";
import { quizAttempts } from "./schema";

const migrationPath = "src/db/migrations/0018_short_deathbird.sql";
const coveringMigrationPath = "src/db/migrations/0019_true_loa.sql";
const summarySql = `
  SELECT question_id, count(*) AS total_attempts, sum(correct) AS correct_attempts,
    sum(case when invalidated_at is not null then 1 else 0 end) AS stale_attempts
  FROM quiz_attempts GROUP BY question_id`;
const optionsSql = `
  SELECT question_id, selected_option, count(*) AS count
  FROM quiz_attempts
  WHERE selected_option IS NOT NULL AND invalidated_at IS NULL
  GROUP BY question_id, selected_option`;

test("question ID index matches the schema and is registered after existing migrations", () => {
  const config = getTableConfig(quizAttempts);
  const questionIndex = config.indexes.find(
    value => value.config.name === "quiz_attempts_question_id_idx",
  );
  expect(questionIndex?.config.columns).toEqual([quizAttempts.questionId]);
  expect(questionIndex?.config.unique).toBe(false);
  const statsIndex = config.indexes.find(value => value.config.name === "quiz_attempts_stats_idx");
  expect(statsIndex?.config.columns).toEqual([
    quizAttempts.questionId, quizAttempts.selectedOption,
    quizAttempts.invalidatedAt, quizAttempts.correct,
  ]);

  const journal = JSON.parse(readFileSync("src/db/migrations/meta/_journal.json", "utf8"));
  const position = journal.entries.findIndex(
    (entry: { tag: string }) => entry.tag === "0018_short_deathbird",
  );
  expect(position).toBeGreaterThan(0);
  const priorTimes = journal.entries.slice(0, position).map(
    (entry: { when: number }) => entry.when,
  );
  expect(journal.entries[position].when).toBeGreaterThan(Math.max(...priorTimes));
  expect(journal.entries[position + 1].tag).toBe("0019_true_loa");
  expect(journal.entries[position + 1].when).toBeGreaterThan(journal.entries[position].when);
});

test("migration preserves attempts and both stats queries use the question ID index", () => {
  const db = new Database(":memory:");
  try {
    db.exec(`
      CREATE TABLE quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER NOT NULL, correct INTEGER NOT NULL,
        selected_option INTEGER, attempted_at TEXT NOT NULL, invalidated_at TEXT
      );
      CREATE INDEX quiz_attempts_attempted_at_idx ON quiz_attempts (attempted_at);
      INSERT INTO quiz_attempts (question_id, correct, selected_option, attempted_at, invalidated_at)
      VALUES
        (1, 1, 0, '2026-10-01', NULL),
        (1, 0, 1, '2026-10-01', NULL),
        (1, 1, 0, '2026-10-01', '2026-10-02'),
        (2, 0, NULL, '2026-10-01', NULL),
        (2, 1, 2, '2026-10-01', NULL);
    `);
    const attemptsBefore = db.query("SELECT * FROM quiz_attempts ORDER BY id").all();
    const summaryBefore = db.query(summarySql).all();
    const optionsBefore = db.query(optionsSql).all();

    db.exec(readFileSync(migrationPath, "utf8"));

    expect(db.query("PRAGMA index_info('quiz_attempts_question_id_idx')").all())
      .toEqual([{ seqno: 0, cid: 1, name: "question_id" }]);
    expect(db.query("SELECT * FROM quiz_attempts ORDER BY id").all()).toEqual(attemptsBefore);
    expect(db.query(summarySql).all()).toEqual(summaryBefore);
    expect(db.query(optionsSql).all()).toEqual(optionsBefore);
    expect(db.query(summarySql).all()).toEqual([
      { question_id: 1, total_attempts: 3, correct_attempts: 2, stale_attempts: 1 },
      { question_id: 2, total_attempts: 2, correct_attempts: 1, stale_attempts: 0 },
    ]);
    expect(db.query(optionsSql).all()).toEqual([
      { question_id: 1, selected_option: 0, count: 1 },
      { question_id: 1, selected_option: 1, count: 1 },
      { question_id: 2, selected_option: 2, count: 1 },
    ]);
    for (const query of [summarySql, optionsSql]) {
      const plan = db.query(`EXPLAIN QUERY PLAN ${query}`).all() as { detail: string }[];
      expect(plan.some(row => row.detail.includes("USING INDEX quiz_attempts_question_id_idx")))
        .toBe(true);
    }
    db.exec(readFileSync(coveringMigrationPath, "utf8"));
    expect(db.query(summarySql).all()).toEqual(summaryBefore);
    expect(db.query(optionsSql).all()).toEqual(optionsBefore);
    expect(db.query("SELECT * FROM quiz_attempts ORDER BY id").all()).toEqual(attemptsBefore);
    for (const query of [summarySql, optionsSql]) {
      const plan = db.query(`EXPLAIN QUERY PLAN ${query}`).all() as { detail: string }[];
      expect(plan.some(row => row.detail.includes("USING COVERING INDEX quiz_attempts_stats_idx")))
        .toBe(true);
      expect(plan.some(row => row.detail.includes("USE TEMP B-TREE"))).toBe(false);
    }
    const summaryPlan = db.query(`EXPLAIN QUERY PLAN ${summarySql}`).all() as { detail: string }[];
    expect(summaryPlan.some(row => row.detail.includes("USE TEMP B-TREE"))).toBe(false);
  } finally {
    db.close();
  }
});
