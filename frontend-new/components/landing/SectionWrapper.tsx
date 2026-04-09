import { Container, Stack } from '@mantine/core';

export default function SectionWrapper({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <Container id={id} size='xl' py={48}>
      <Stack gap='xl'>{children}</Stack>
    </Container>
  );
}
