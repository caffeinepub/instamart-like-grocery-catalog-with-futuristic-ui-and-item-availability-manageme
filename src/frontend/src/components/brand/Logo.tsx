export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img 
        src="/assets/generated/mylocal-kart-logo.dim_256x256.png" 
        alt="MyLocal Kart Logo" 
        className="w-10 h-10 object-contain"
      />
      <span className="text-xl font-bold neon-text">MyLocal Kart</span>
    </div>
  );
}
