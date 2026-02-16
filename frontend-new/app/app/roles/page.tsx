import { Container, Stack, Title, Divider } from '@mantine/core';
import RoleForm from './RoleForm';
import RoleList from './RoleList';
import { listRoles } from './actions';
import { Role } from '@/types/role';

export default async function RolesPage() {
  const roles = await listRoles();

  return (
    <Container size='sm' py='xl'>
      <Stack gap='lg'>
        <Title order={2}>Role Management</Title>

        <RoleForm />

        <Divider />

        <RoleList roles={roles as Role[]} />
      </Stack>
    </Container>
  );
}
