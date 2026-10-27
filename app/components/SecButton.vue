<template>
  <button type="button" class="sec_button">
    <slot />
  </button>
</template>

<style>
.sec_button {
  border: 1px solid var(--primary);
  border-radius: 0.5rem;
  color: var(--accent-text);
  background-color: transparent;
  padding: 0.4rem 1.125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s ease-in-out;
}

.sec_button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.18);
}
</style>
