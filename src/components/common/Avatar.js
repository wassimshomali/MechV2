const AVATAR_COLORS = [
  'bg-primary-600',
  'bg-success-600',
  'bg-warning-600',
  'bg-error-600',
  'bg-info-600',
];

export function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name) {
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function renderAvatar(name, { size = 'sm' } = {}) {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  return `<div class="avatar avatar-${size} ${color}" aria-hidden="true">${initials}</div>`;
}
