import { Stack, Text } from '@mantine/core';

export default function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Stack gap={6}>
      <Text size='1.75rem' fw={700} lh={1.2}>
        {title}
      </Text>
      <Text c='dimmed' maw={680}>
        {description}
      </Text>
    </Stack>
  );
}
