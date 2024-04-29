"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */
  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title
             FROM jobs
             WHERE title = $1`,
      [title]
    );
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate job: ${title}`);
    }

    const result = await db.query(
      `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */
  static async findAll(reqQueryStr = {}) {
    const { minSalary, hasEquity, title } = reqQueryStr;

    let result = `SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs`;
    let whereFilter = "";
    if (title !== undefined) {
      if (whereFilter === "") {
        whereFilter += `title ILIKE '%${title}%'`;
      } else {
        whereFilter += ` AND title ILIKE '%${title}%'`;
      }
    }

    if (minSalary !== undefined) {
      if (whereFilter === "") {
        whereFilter += `salary >= '${minSalary}'`;
      } else {
        whereFilter += ` AND salary >= '${minSalary}'`;
      }
    }

    if (hasEquity && hasEquity.toLowerCase() === "true") {
      if (whereFilter === "") {
        whereFilter += `equity > 0 AND equity IS NOT NULL`;
      } else {
        whereFilter += ` AND equity > 0 AND equity IS NOT NULL`;
      }
    }

    if (whereFilter !== "") {
      result += " WHERE " + whereFilter;
    }

    result += " ORDER BY title";

    const jobs = await db.query(result);
    return jobs.rows;
  }

  /** Given a job title, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(title) {
    const jobRes = await db.query(
      `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE title = $1`,
      [title]
    );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(title, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE title = $${values.length + 1} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, title]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);

    return job;
  }

  /** Delete a job from database with given its id; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(title) {
    const result = await db.query(
      `DELETE
             FROM jobs
             WHERE title = $1
             RETURNING id`,
      [title]
    );

    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${title}`);
  }
}

module.exports = Job;
