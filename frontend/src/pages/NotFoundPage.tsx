import { Button, Stack } from '@mantine/core';
import { ArrowRight, Compass } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../components/StateViews';

export function NotFoundPage() {
  return (
    <Stack justify="center" mih="60vh">
      <ErrorState
        code="Û´Û°Û´"
        title="Ø§ÛŒÙ† Ù…Ø³ÛŒØ± Ø¯Ø± BloodNet ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯"
        description="Ù†Ø´Ø§Ù†ÛŒ ÙˆØ§Ø±Ø¯Ø´Ø¯Ù‡ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª ÛŒØ§ ØµÙØ­Ù‡ Ø¬Ø§Ø¨Ù‡â€ŒØ¬Ø§ Ø´Ø¯Ù‡ Ø§Ø³Øª. Ø§Ø² Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ ÛŒØ§ ÙÙ‡Ø±Ø³Øª Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ Ø§Ø¯Ø§Ù…Ù‡ Ø¯Ù‡ÛŒØ¯."
        action={
          <Button
            component={Link}
            to="/"
            color="brand"
            leftSection={<ArrowRight size={16} />}
          >
            Ø¨Ø§Ø²Ú¯Ø´Øª Ø¨Ù‡ Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯
          </Button>
        }
      />
      <Stack align="center" gap={4}>
        <Compass size={18} color="#6b4a4f" aria-hidden="true" />
        <span className="text-xs text-[var(--bn-muted)]">
          Ù…Ø³ÛŒØ±Ù‡Ø§ÛŒ Ø§ØµÙ„ÛŒ: Ø¯Ø§Ø´Ø¨ÙˆØ±Ø¯ØŒ Ø¯Ø±Ø®ÙˆØ§Ø³Øªâ€ŒÙ‡Ø§ØŒ Ù…ÙˆØ¬ÙˆØ¯ÛŒØŒ Ø§Ù‡Ø¯Ø§Ú©Ù†Ù†Ø¯Ù‡ Ùˆ Ø±ÙˆÛŒØ¯Ø§Ø¯Ù‡Ø§
        </span>
      </Stack>
    </Stack>
  );
}

