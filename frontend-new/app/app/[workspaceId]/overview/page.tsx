"use client";

import { useQuery } from "@tanstack/react-query";
import { 
    Paper, 
    Text, 
    Title, 
    Group, 
    Table, 
    Badge, 
    Loader, 
    Center, 
    Stack,
    ThemeIcon,
    SimpleGrid,
    Modal,
    ActionIcon,
    Tooltip,
    Code,
    ScrollArea
} from "@mantine/core";
import { 
    IconRocket, 
    IconServer, 
    IconFolder, 
    IconActivity,
    IconCheck,
    IconX,
    IconClock,
    IconFileText
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { getDeploymentStats, getDeploymentLogs } from "@/service/dashboard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

dayjs.extend(relativeTime);

export default function OverviewPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedDeployment, setSelectedDeployment] = useState<{uuid: string, name: string} | null>(null);

    const { data: stats, isLoading, isError } = useQuery({
        queryKey: ["dashboard-stats", workspaceId],
        queryFn: () => getDeploymentStats(workspaceId),
        enabled: !!workspaceId,
    });

    const { data: logs, isLoading: isLoadingLogs } = useQuery({
        queryKey: ["deployment-logs", workspaceId, selectedDeployment?.uuid],
        queryFn: () => getDeploymentLogs(workspaceId, selectedDeployment!.uuid),
        enabled: !!selectedDeployment?.uuid,
    });

    if (isLoading) {
        return (
            <Center h="100vh">
                <Loader size="xl" />
            </Center>
        );
    }

    if (isError) {
        return (
            <Center h="100vh">
                <Text color="red">Failed to load dashboard statistics.</Text>
            </Center>
        );
    }

    const statData = [
        { title: "Total Projects", value: stats.total_projects, icon: IconFolder, color: "blue" },
        { title: "Total Services", value: stats.total_services, icon: IconRocket, color: "teal" },
        { title: "Total Servers", value: stats.total_servers, icon: IconServer, color: "indigo" },
        { title: "Total Deployments", value: stats.total_deployments, icon: IconActivity, color: "orange" },
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "success": return "green";
            case "failed": return "red";
            case "deploying": return "blue";
            case "pending": return "yellow";
            default: return "gray";
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case "success": return "Deployed";
            case "failed": return "Failed";
            case "deploying": return "Deploying";
            case "pending": return "Queued";
            default: return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "success": return <IconCheck size={14} />;
            case "failed": return <IconX size={14} />;
            case "deploying": return <Loader size={12} />;
            case "pending": return <IconClock size={14} />;
            default: return <IconClock size={14} />;
        }
    };

    const handleViewLogs = (deployment: { uuid: string; serviceName: string }) => {
        setSelectedDeployment({ uuid: deployment.uuid, name: deployment.serviceName });
        open();
    };

    return (
        <Stack gap="xl" p="md">
            <div>
                <Title order={2} mb="xs">Dashboard Overview</Title>
                <Text c="dimmed">Detailed overview of your workspace deployments and resources.</Text>
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
                {statData.map((stat) => (
                    <Paper key={stat.title} p="md" radius="md" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                                {stat.title}
                            </Text>
                            <ThemeIcon color={stat.color} variant="light" size="lg" radius="md">
                                <stat.icon size={20} />
                            </ThemeIcon>
                        </Group>
                        <Group align="flex-end" gap="xs">
                            <Text fw={700} size="xl">
                                {stat.value}
                            </Text>
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            <Paper p="md" radius="md" withBorder>
                <Title order={3} mb="lg">Recent Deployments</Title>
                <Table.ScrollContainer minWidth={500}>
                    <Table verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Service</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Started</Table.Th>
                                <Table.Th>Duration</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {stats.recent_deployments?.length > 0 ? (
                                stats.recent_deployments.map((deployment: { uuid: string; serviceName: string; status: string; startTime: string; endTime: string | null }) => (
                                    <Table.Tr key={deployment.uuid}>
                                        <Table.Td>
                                            <Text fw={500}>{deployment.serviceName}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge 
                                                color={getStatusColor(deployment.status)} 
                                                variant="light"
                                                leftSection={getStatusIcon(deployment.status)}
                                            >
                                                {getStatusText(deployment.status)}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{dayjs(deployment.startTime).fromNow()}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {deployment.endTime 
                                                    ? `${dayjs(deployment.endTime).diff(dayjs(deployment.startTime), 'second')}s`
                                                    : deployment.status === 'pending' ? '-' : 'In Progress'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Tooltip label="View Logs">
                                                <ActionIcon 
                                                    variant="light" 
                                                    color="gray" 
                                                    onClick={() => handleViewLogs(deployment)}
                                                >
                                                    <IconFileText size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Text ta="center" c="dimmed" py="xl">No recent deployments found.</Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Paper>

            <Modal 
                opened={opened} 
                onClose={close} 
                title={`Deployment Logs: ${selectedDeployment?.name}`}
                size="xl"
                radius="md"
            >
                <ScrollArea.Autosize mah={600} type="always" bg="dark.9" p="md">
                    {isLoadingLogs ? (
                        <Center py="xl">
                            <Loader size="sm" />
                        </Center>
                    ) : (
                        <Code block color="dark.9" c="gray.3" style={{ whiteSpace: 'pre-wrap' }}>
                            {logs?.logs || "No logs available for this deployment."}
                        </Code>
                    )}
                </ScrollArea.Autosize>
            </Modal>
        </Stack>
    );
}