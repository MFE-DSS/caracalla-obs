import './ResponsiveStack.css';

interface ResponsiveStackProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveStack({ children, columns = 1, gap = 'md' }: ResponsiveStackProps) {
  return (
    <div className={`stack stack--col-${columns} stack--gap-${gap}`}>
      {children}
    </div>
  );
}
