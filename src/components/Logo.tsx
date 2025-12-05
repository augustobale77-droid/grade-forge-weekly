interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-[60px]',
  md: 'max-w-[96px]',
  lg: 'max-w-[140px]',
};

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <img
      src="https://i.imgur.com/tmPk12A.png"
      alt="Study Manager"
      className={`h-auto ${sizeClasses[size]} ${className}`}
    />
  );
}
