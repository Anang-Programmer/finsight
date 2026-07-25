import { icons } from 'lucide-react';

interface IconProps {
  name: string;
  color?: string;
  size?: number | string;
  className?: string;
}

export default function Icon({ name, color, size, className }: IconProps) {
  // Convert kebab-case to PascalCase for lucide-react (e.g. 'shopping-cart' -> 'ShoppingCart')
  let pascalName = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LucideIcon = (icons as any)[pascalName] || icons.Box; // default to Box if not found

  return <LucideIcon color={color} size={size} className={className} />;
}
