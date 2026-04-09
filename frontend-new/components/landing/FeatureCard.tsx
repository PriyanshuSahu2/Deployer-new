import { Box, Stack, Text } from '@mantine/core';

export default function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Box
      p='lg'
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 'var(--mantine-radius-md)',
        background: 'var(--mantine-color-white)',
      }}>
      <Stack gap='md'>
        <Box
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--mantine-radius-md)',
            background: 'var(--mantine-color-indigo-light)',
            color: 'var(--mantine-color-indigo-filled)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon}
        </Box>
        <div>
          <Text fw={600}>{title}</Text>
          <Text size='sm' c='dimmed' mt={6}>
            {description}
          </Text>
        </div>
      </Stack>
    </Box>
  );
}
