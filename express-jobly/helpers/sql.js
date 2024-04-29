const { BadRequestError } = require("../expressError");

/**
 * sqlForPartialUpdate is designed to generate SQL update statements for updating rows in a database table based on the provided data and mapping.
 * If the 'dataToUpdate' object is empty (no data is provided), it throws a 'BadRequestError'.
 * example:
 * const dataToUpdate = {
    firstName: 'Alice',
    age: 30};
   const jsToSqlMapping = {
     firstName: 'first_name'};
   const result = sqlForPartialUpdate(dataToUpdate, jsToSqlMapping);
   console.log(result.setCols);  // Output: "first_name=$1, age=$2"
   console.log(result.values);   // Output: ["Alice", 30]
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
