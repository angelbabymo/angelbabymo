import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover, onClick, style }: CardProps) {
  return (
    <div
      className={cn('card', hover && 'card-hover cursor-pointer', className)}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
