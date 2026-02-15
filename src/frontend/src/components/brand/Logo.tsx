interface LogoProps {
  onClick?: () => void;
  className?: string;
}

export default function Logo({ onClick, className = '' }: LogoProps) {
  const logoContent = (
    <>
      <img 
        src="/assets/generated/mylocal-kart-logo-v2.dim_256x256.png" 
        alt="MyLocal Kart Logo" 
        className="w-10 h-10 object-contain"
      />
      <span className="text-xl font-bold neon-text">MyLocal Kart</span>
    </>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}
        aria-label="Open login options"
      >
        {logoContent}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoContent}
    </div>
  );
}
