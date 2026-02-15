'use client';

import { useTransition } from 'react';
import { Button, TextInput, Textarea, Stack, Paper } from '@mantine/core';
import { createRole } from './actions';

export default function RoleForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createRole({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        uuid: '',
        created_at: '',
      });
    });
  };

  return (
    <Paper shadow='xs' p='md' withBorder>
      <form action={handleSubmit}>
        <Stack>
          <TextInput
            name='name'
            label='Role Name'
            placeholder='Admin'
            required
          />

          <Textarea
            name='description'
            label='Description'
            placeholder='Role description...'
          />

          <Button type='submit' loading={isPending}>
            Add Role
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
