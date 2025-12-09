interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

import logoImage from '@/assets/logo.png';

const sizeClasses = {
  sm: 'max-w-[80px]',
  md: 'max-w-[120px]',
  lg: 'max-w-[180px]',
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt="Study Manager"
      className={`h-auto ${sizeClasses[size]} ${className}`}
    />
  );
}
