interface UserDisplayInput {
  fullName?: string | null;
  role?: string | null;
  email?: string | null;
}

interface UserDisplay {
  name: string;
  role: string;
  firstName: string;
  initial: string;
}

export const getUserDisplay = ({ fullName, role, email }: UserDisplayInput): UserDisplay => {
  const name = fullName?.trim() || email?.trim() || 'Usuário';
  const firstName = name.split(' ')[0] || 'Usuário';
  const initial = firstName.charAt(0).toUpperCase() || '?';
  return {
    name,
    role: role?.trim() || '',
    firstName,
    initial,
  };
};
