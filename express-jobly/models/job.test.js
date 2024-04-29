"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "newJob",
    salary: 500,
    equity: 0,
    company_handle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "newJob",
      salary: 500,
      equity: "0",
      companyHandle: "c3",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'newJob'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "newJob",
        salary: 500,
        equity: "0",
        company_handle: "c3",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */
describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 100,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 200,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });

  test("valid title is passed in the query string", async function () {
    let jobs = await Job.findAll({ title: "job" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job1",
        salary: 100,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: expect.any(Number),
        title: "job2",
        salary: 200,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
  test("invalid title is passed in the query string", async function () {
    let jobs = await Job.findAll({ title: "fakejobignoreme" });
    expect(jobs).toEqual([]);
  });

  test("minSalary is passed in the query string", async function () {
    let jobs = await Job.findAll({ minSalary: 200 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job2",
        salary: 200,
        equity: "0",
        companyHandle: "c2",
      },
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });

  test("hasEquity is true", async function () {
    let jobs = await Job.findAll({ hasEquity: "true" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "job3",
        salary: 300,
        equity: "0.1",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */
describe("get", function () {
  test("works", async function () {
    let job = await Job.get("job1");
    expect(job).toEqual({
      id: expect.any(Number),
      title: "job1",
      salary: 100,
      equity: "0",
      companyHandle: "c1",
    });
  });

  test("not found if no such company", async function () {
    try {
      await Job.get("nope");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "job11",
    salary: 1100,
  };

  test("works", async function () {
    let job = await Job.update("job1", updateData);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "job11",
      salary: 1100,
      equity: "0",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE title = 'job11'`
    );
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "job11",
        salary: 1100,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update("nope", updateData);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("job2", {});
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("job1");
    const res = await db.query("SELECT title FROM jobs WHERE title='job1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove("nope");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
