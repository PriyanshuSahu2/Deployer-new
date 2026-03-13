import { Button, Group, TextInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";

export default function CreateEnvironmentModal({ onSubmit }: { onSubmit: (name: string) => void }) {
  const form = useForm({
    initialValues: {
      name: "",
    },
    validate: {
      name: (v) => (v.length < 2 ? "Environment name too short" : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    onSubmit(values.name);
    modals.closeAll();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Environment Name"
          placeholder="e.g. UAT, QA, PREPROD"
          required
          {...form.getInputProps("name")}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit">Create Environment</Button>
        </Group>
      </Stack>
    </form>
  );
}
