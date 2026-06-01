const fs = require("fs");
const path = require("path");
const { getAll, getById, add, remove, getTaskCount } = require("../public/app");

const dbPath = path.join(__dirname, "../data/tasks.json");


// Clear the database before each test
beforeEach(() => {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
});

test("getAll returns empty array", async () => {
  expect(await getAll()).toEqual([]);
});

test("add task", async () => {
  const task = await add("My task");
  expect(task.title).toBe("My task");
  expect((await getAll()).length).toBe(1);
});

test("getById returns correct task", async () => {
  const task = await add("Find me");
  const found = await getById(task.id);
  expect(found.title).toBe("Find me");
});

test("remove task", async () => {
  const task = await add("Delete me");
  const tasks = await remove(task.id);
  expect(tasks.length).toBe(0);
});

test("getTaskCount returns 0 initially", async () => {
  expect(await getTaskCount()).toBe(0);
});

test("getTaskCount returns correct number", async () => {
  await add("Task 1");
  await add("Task 2");
  expect(await getTaskCount()).toBe(2);
});

