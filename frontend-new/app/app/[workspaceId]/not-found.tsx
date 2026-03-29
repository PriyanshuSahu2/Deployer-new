"use client";

import { Container, Title, Text, Button, Group, Stack, Box } from "@mantine/core";
import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const router = useRouter();

  return (
    <Box className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
      {/* Background Decorative Element */}
      <Box
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <Text
          variant="gradient"
          gradient={{ from: 'gray.1', to: 'gray.3', deg: 45 }}
          className="text-[20rem] font-black opacity-10 leading-none"
        >
          404
        </Text>
      </Box>

      <Container size="md" className="relative" style={{ zIndex: 1 }}>
        <Stack align="center" gap="xl" className="text-center">
          <Box>
            <Title className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
              Oops! Page not found
            </Title>
            <Text c="dimmed" size="lg" className="max-w-md mt-6 mx-auto leading-relaxed">
              The page you are looking for might have been moved, deleted, or
              never existed. Let&apos;s get you back on track.
            </Text>
          </Box>

          <Group gap="md" mt="xl">
            <Button
              variant="default"
              size="lg"
              radius="md"
              leftSection={<IconArrowLeft size={20} />}
              onClick={() => router.back()}
              className="px-8"
            >
              Go Back
            </Button>
            <Button
              size="lg"
              radius="md"
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
              leftSection={<IconHome size={20} />}
              onClick={() => router.push("/app")}
              className="px-8 shadow-lg shadow-blue-500/20"
            >
              Back to Dashboard
            </Button>
          </Group>
        </Stack>
      </Container>
    </Box>
  );
};

export default NotFound;
