const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("testing sqlForPartialUpdate function", () => {
  test("with valid input", () => {
    const dataToUpdate = {
      firstName: "Alice",
      age: 30,
    };

    const jsToSqlMapping = {
      firstName: "first_name",
    };

    const result = sqlForPartialUpdate(dataToUpdate, jsToSqlMapping);
    expect(result.setCols).toEqual(`"first_name"=$1, "age"=$2`);
    expect(result.values).toEqual(["Alice", 30]);
  });
});
