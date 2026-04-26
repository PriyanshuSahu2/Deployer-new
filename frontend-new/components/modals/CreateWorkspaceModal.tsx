import { useCreateWorkspace } from "@/hooks/useWorkspace";
import { Button, Group, TextInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";

export default function CreateWorkspaceModal() {
  const { mutateAsync: createWorkspace } = useCreateWorkspace();

  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (v) => (v.length < 3 ? "Workspace name too short" : null),    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {

      const res = await createWorkspace(values.name);
      console.log(res);
    } catch (err) {
      console.log(err);
    } finally {
      form.reset();
      modals.closeAll();
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Workspace name"
          placeholder="My Company"
          {...form.getInputProps("name")}
        />

        {/* <TextInput
          label="Workspace slug"
          placeholder="my-company"
          {...form.getInputProps("slug")}
        /> */}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </Group>
      </Stack>
    </form>
  );
}
