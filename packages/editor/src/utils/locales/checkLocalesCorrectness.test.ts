import { checkLocalesCorrectness } from "./checkLocalesCorrectness";

describe("check locales correctness", () => {
  test("throws when empty array", () => {
    expect(() => {
      checkLocalesCorrectness([]);
    }).toThrow("can't be empty");
  });

  test("throws when there is no default locale", () => {
    expect(() => {
      checkLocalesCorrectness([{ code: "en" }, { code: "pl" }, { code: "de" }]);
    }).toThrow("One locale must be set as default");
  });

  test("throws when there are more than 1 locales", () => {
    expect(() => {
      checkLocalesCorrectness([
        { code: "en", isDefault: true },
        { code: "pl", isDefault: true },
        { code: "de" },
      ]);
    }).toThrow("you set more than one");
  });

  test("throws when default locale has fallback", () => {
    expect(() => {
      checkLocalesCorrectness([
        { code: "en", isDefault: true, fallback: "pl" },
        { code: "pl" },
      ]);
    }).toThrow("fallback");
  });

  test("throws when there are incorrect fallbacks", () => {
    expect(() => {
      checkLocalesCorrectness([
        { code: "en", isDefault: true },
        { code: "pl", fallback: "en" },
        { code: "de", fallback: "enxxx" },
      ]);
    }).toThrow("doesn't exist in the locales list");
  });

  test("throws when circulars are there", () => {
    expect(() => {
      checkLocalesCorrectness([
        { code: "en", isDefault: true },
        { code: "pl1", fallback: "pl2" },
        { code: "pl2", fallback: "pl3" },
        { code: "pl3", fallback: "pl1" },
      ]);
    }).toThrow("circular");
  });

  test("returns true if everything correct", () => {
    expect(
      checkLocalesCorrectness([
        { code: "en", isDefault: true },
        { code: "pl", fallback: "en" },
        { code: "pl2", fallback: "pl" },
        { code: "de" },
      ]),
    ).toBe(true);
  });
});
