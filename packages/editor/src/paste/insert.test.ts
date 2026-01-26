import {
  NoCodeComponentEntry,
  NoCodeComponentDefinition,
} from "@easyblocks/core";
import * as internals from "@easyblocks/core/_internals";
import { uniqueId } from "@easyblocks/utils";
import { Form } from "../form";
import { insertCommand } from "./insert";
import * as reconcile from "./reconcile";

// Mock the @easyblocks/core/_internals module to allow spying
jest.mock("@easyblocks/core/_internals", () => ({
  ...jest.requireActual("@easyblocks/core/_internals"),
  findComponentDefinition: jest.fn(),
  duplicateConfig: jest.fn(),
}));

// Mock the reconcile module
jest.mock("./reconcile", () => ({
  ...jest.requireActual("./reconcile"),
  reconcile: jest.fn(),
}));

const createForm = (
  initialValues: Record<string, any> = { data: [] },
): Form => {
  const form = new Form({
    id: "test",
    label: "Test",
    onSubmit: () => {},
    initialValues,
  });

  Object.keys(form.mutators).forEach((key) => {
    jest.spyOn(form.mutators, key);
  });

  return form;
};

const createConfigComponent = (
  init: Partial<NoCodeComponentEntry> = {},
): NoCodeComponentEntry => ({
  _id: uniqueId(),
  _component: "",
  ...init,
});

const createComponentDefinition = (
  init: Partial<NoCodeComponentDefinition> = {},
): NoCodeComponentDefinition => ({
  id: "",
  schema: [],
  ...init,
});

describe("insert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each`
    name                      | index   | schema                                                            | expectedResult
    ${"path.0.chldren"}       | ${0}    | ${{ accepts: ["$item"], type: "component-collection", prop: "" }} | ${"path.0.chldren.0"}
    ${"data.0.stack.0.items"} | ${1337} | ${{ accepts: ["$item"], type: "component", prop: "" }}            | ${"data.0.stack.0.items.1337"}
  `(
    "Should return path ($expectedResult) to inserted item",
    ({ name, index, expectedResult, schema }) => {
      const form = createForm();

      const item = createConfigComponent({
        _id: "1",
        _itemProps: { prop1: "" },
      });

      const reconciledItem = createConfigComponent({
        _id: "2",
        _itemProps: { prop2: "" },
      });

      const duplicatedItem = createConfigComponent({
        _id: "3",
        _itemProps: { prop2: "" },
      });

      (internals.findComponentDefinition as jest.Mock).mockReturnValue({
        tags: [],
        id: "$item",
      });

      (internals.duplicateConfig as jest.Mock).mockReturnValue(duplicatedItem);

      (reconcile.reconcile as jest.Mock).mockReturnValue(
        jest.fn().mockReturnValue(reconciledItem),
      );

      const insert = insertCommand({
        context: {} as any,
        form: form,
        schema,
        templateId: "",
      });

      const result = insert(name, index, item);

      expect(result).toEqual(expectedResult);
      expect(form.mutators.insert).toHaveBeenCalledTimes(1);
      expect(form.mutators.insert).toHaveBeenCalledWith(
        name,
        index,
        duplicatedItem,
      );
    },
  );

  it("Should return null when item definition cannot be found", () => {
    const form = createForm();

    (internals.findComponentDefinition as jest.Mock).mockReturnValue(undefined);

    (internals.duplicateConfig as jest.Mock).mockReturnValue({
      _component: "xxx",
    });

    const mockReconcile = jest.fn();
    (reconcile.reconcile as jest.Mock).mockReturnValue(mockReconcile);

    const insert = insertCommand({
      context: {} as any,
      form: form,
      schema: {
        prop: "",
        type: "component-collection",
        accepts: ["$item"],
      },
      templateId: "",
    });

    const result = insert("name", 1, createConfigComponent());

    expect(result).toEqual(null);
    expect(form.mutators.insert).not.toHaveBeenCalled();
    expect(mockReconcile).not.toHaveBeenCalled();
  });

  it.each`
    schema
    ${{ accepts: ["TAG_2"], type: "component", prop: "" }}
    ${{ accepts: ["ID_2"], type: "component-collection", prop: "" }}
    ${{ accepts: ["TAG_3"], type: "component", prop: "", required: true }}
  `("Should return null when items does not match the schema", ({ schema }) => {
    const item = createConfigComponent();

    const form = createForm();

    (internals.findComponentDefinition as jest.Mock).mockReturnValue(undefined);

    (internals.duplicateConfig as jest.Mock).mockReturnValue(item);

    const mockReconcile = jest.fn();
    (reconcile.reconcile as jest.Mock).mockReturnValue(mockReconcile);

    const insert = insertCommand({
      context: {} as any,
      form: form,
      schema,
      templateId: "",
    });

    const result = insert("name", 1, item);

    expect(result).toEqual(null);
    expect(form.mutators.insert).not.toHaveBeenCalled();
    expect(mockReconcile).not.toHaveBeenCalled();
  });
});
