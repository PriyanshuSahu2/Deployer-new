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
    Modal,
    ActionIcon,
    Tooltip,
    Code,
    ScrollArea,
    TextInput
} from "@mantine/core";
import { 
    IconCheck,
    IconX,
    IconClock,
    IconFileText,
    IconSearch,
    IconHistory
} from "@tabler/icons-react";
import { useParams } from "next/navigation";
import { getWorkspaceDeployments, getDeploymentLogs } from "@/service/dashboard";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useDisclosure } from "@mantine/hooks";
import { useState, useMemo } from "react";

dayjs.extend(relativeTime);

interface Deployment {
    uuid: string;
    serviceName: string;
    status: string;
    startTime: string;
    endTime: string | null;
}

export default function DeploymentsPage() {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const [search, setSearch] = useState("");
    const [opened, { open, close }] = useDisclosure(false);
    const [selectedDeployment, setSelectedDeployment] = useState<{uuid: string, name: string} | null>(null);

    const { data: deployments, isLoading, isError } = useQuery<Deployment[]>({
        queryKey: ["workspace-deployments", workspaceId],
        queryFn: () => getWorkspaceDeployments(workspaceId),
        enabled: !!workspaceId,
    });

    const { data: logs, isLoading: isLoadingLogs } = useQuery({
        queryKey: ["deployment-logs", workspaceId, selectedDeployment?.uuid],
        queryFn: () => getDeploymentLogs(workspaceId, selectedDeployment!.uuid),
        enabled: !!selectedDeployment?.uuid,
    });

    const filteredDeployments = useMemo(() => {
        if (!deployments) return [];
        return deployments.filter((d) => 
            d.serviceName.toLowerCase().includes(search.toLowerCase()) ||
            d.status.toLowerCase().includes(search.toLowerCase())
        );
    }, [deployments, search]);

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
                <Text color="red">Failed to load deployment history.</Text>
            </Center>
        );
    }

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

    const handleViewLogs = (deployment: Deployment) => {
        setSelectedDeployment({ uuid: deployment.uuid, name: deployment.serviceName });
        open();
    };

    return (
        <Stack gap="xl" p="md">
            <Group justify="space-between">
                <div>
                    <Title order={2} mb="xs">Deployment History</Title>
                    <Text c="dimmed">Complete list of all deployments in this workspace.</Text>
                </div>
                <Group>
                    <TextInput
                        placeholder="Search by service or status..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        w={300}
                    />
                </Group>
            </Group>

            <Paper p="md" radius="md" withBorder>
                <Table.ScrollContainer minWidth={800}>
                    <Table verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Service</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Started</Table.Th>
                                <Table.Th>Finished</Table.Th>
                                <Table.Th>Duration</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {filteredDeployments.length > 0 ? (
                                filteredDeployments.map((deployment) => (
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
                                            <Text size="sm">{dayjs(deployment.startTime).format('MMM D, h:mm A')}</Text>
                                            <Text size="xs" c="dimmed">{dayjs(deployment.startTime).fromNow()}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {deployment.endTime 
                                                    ? dayjs(deployment.endTime).format('MMM D, h:mm A')
                                                    : '-'}
                                            </Text>
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
                                    <Table.Td colSpan={6}>
                                        <Center py="xl">
                                            <Stack align="center" gap="xs">
                                                <IconHistory size={40} color="gray" opacity={0.5} />
                                                <Text ta="center" c="dimmed">No deployments found matching your search.</Text>
                                            </Stack>
                                        </Center>
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
