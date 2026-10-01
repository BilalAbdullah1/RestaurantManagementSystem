export const getInitials = (firstName?: string, lastName?: string) => {
  const f = firstName ? firstName.charAt(0).toUpperCase() : '';
  const l = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${f}${l}` || '?';
};

export const getAvatarGradient = (name: string) => {
  if (!name) return 'bg-gray-400';
  
  const gradients = [
    'bg-gradient-to-br from-purple-500 to-indigo-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-emerald-400 to-teal-500',
    'bg-gradient-to-br from-blue-400 to-cyan-500',
    'bg-gradient-to-br from-orange-400 to-red-500',
    'bg-gradient-to-br from-amber-400 to-orange-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};