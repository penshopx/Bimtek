// Diagnostic benchmark, not a timing-sensitive CI assertion.
// Run: bun run scripts/benchmark-quiz-stats.mjs
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sql } from "drizzle-orm";
import { quizAttempts } from "../src/db/schema.ts";

console.log(JSON.stringify({ runtime: Bun.version, platform: process.platform, arch: process.arch }));
for (const layout of ["interleaved", "clustered"]) {
  for (const rowCount of [1_000, 10_000, 100_000]) {
    const sqlite = new Database(":memory:");
    try {
      sqlite.exec(`CREATE TABLE quiz_attempts (
        id INTEGER PRIMARY KEY, question_id INTEGER NOT NULL, correct INTEGER NOT NULL,
        selected_option INTEGER, attempted_at TEXT NOT NULL, invalidated_at TEXT
      );
      CREATE INDEX quiz_attempts_attempted_at_idx ON quiz_attempts(attempted_at);`);
      const insert = sqlite.query("INSERT INTO quiz_attempts VALUES (?, ?, ?, ?, ?, ?)");
      sqlite.transaction(() => {
        for (let i = 0; i < rowCount; i++) {
          insert.run(i, layout === "interleaved" ? i % 100 + 1 : Math.floor(i / (rowCount / 100)) + 1,
            i % 2, i % 13 === 0 ? null : Math.floor(i / 100) % 4,
            "2026-10-01", i % 10 === 0 ? "2026-10-02" : null);
        }
      })();
      const db = drizzle(sqlite);
      const queries = [
        db.select({
          questionId: quizAttempts.questionId,
          totalAttempts: sql`count(*)`,
          correctAttempts: sql`sum(${quizAttempts.correct})`,
          staleAttempts: sql`sum(case when ${quizAttempts.invalidatedAt} is not null then 1 else 0 end)`,
        }).from(quizAttempts).groupBy(quizAttempts.questionId).toSQL().sql,
        db.select({
          questionId: quizAttempts.questionId,
          selectedOption: quizAttempts.selectedOption,
          count: sql`count(*)`,
        }).from(quizAttempts)
          .where(sql`${quizAttempts.selectedOption} IS NOT NULL AND ${quizAttempts.invalidatedAt} IS NULL`)
          .groupBy(quizAttempts.questionId, quizAttempts.selectedOption).toSQL().sql,
      ];
      const measure = () => queries.map(query => {
        const statement = sqlite.query(query);
        for (let i = 0; i < 3; i++) statement.all();
        const times = Array.from({ length: 15 }, () => {
          const start = performance.now();
          statement.all();
          return performance.now() - start;
        }).sort((a, b) => a - b);
        return Number(times[7].toFixed(3));
      });
      const unindexedMs = measure();
      sqlite.exec(readFileSync("src/db/migrations/0018_short_deathbird.sql", "utf8"));
      const questionIndexMs = measure();
      sqlite.exec(readFileSync("src/db/migrations/0019_true_loa.sql", "utf8"));
      const coveringIndexMs = measure();
      const plans = queries.map(query => sqlite.query(`EXPLAIN QUERY PLAN ${query}`).all());
      console.log(JSON.stringify({ layout, rowCount, unindexedMs, questionIndexMs, coveringIndexMs, plans }));
    } finally {
      sqlite.close();
    }
  }
}
