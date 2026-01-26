import { Box, Flex, Table, Text } from "@radix-ui/themes";
import { cookies } from "next/headers";
import { EasyblocksEditorDialog } from "../components/EasyblocksEditorDialog";
import { RemoveDocumentButton } from "./RemoveDocumentButton";

const documents = [
  {
    id: "appShell",
    title: "App Shell",
    rootComponentId: "AppShell",
  },
  {
    id: "welcomeScreen",
    title: "Welcome Screen",
    rootComponentId: "WelcomeScreenContent",
  },
  {
    id: "assetScreen",
    title: "Asset Screen",
    rootComponentId: "AssetScreenContent",
  },
];

export default async function DocumentsPage() {
  const cookieStore = await cookies();

  return (
    <main className="container mx-auto">
      <Box mb="4">
        <Text size="8">Documents</Text>
      </Box>
      <Table.Root>
        <Table.Body>
          {documents.map((d) => {
            const documentCookieId = `${d.id}DocumentId`;
            const documentCookie = cookieStore.get(documentCookieId);
            const isDefined = !!documentCookie?.value;

            return (
              <Table.Row key={d.id}>
                <Table.Cell className="py-3 px-4 text-right">
                  {d.title}
                </Table.Cell>

                <Table.Cell className="py-3 px-4">
                  <Flex gap={"3"}>
                    <EasyblocksEditorDialog
                      documentId={documentCookie?.value}
                      cookieId={documentCookieId}
                      rootComponentId={d.rootComponentId}
                    />
                    {isDefined && (
                      <>
                        {" "}
                        · <RemoveDocumentButton cookieId={documentCookieId} />
                      </>
                    )}
                  </Flex>
                </Table.Cell>

                <Table.Cell className="py-3 px-4 text-slate-500">
                  {documentCookie?.value ?? "-"}
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </main>
  );
}
