export default function StorefrontHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="absolute inset-0 scanline pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-slide-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="neon-text">Shop Local</span>
              <br />
              <span className="text-muted-foreground">Support Your Community</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Fresh groceries, daily essentials, and more from local vendors. 
              Experience the future of community shopping.
            </p>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse-neon" />
                <span>Live Inventory</span>
              </div>
              <div className="flex items-center gap-2 glass-panel px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-neon" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl" />
            <img 
              src="/assets/generated/mylocal-kart-groceries-hero.dim_1600x900.jpg" 
              alt="MyLocal Kart - Fresh groceries and local marketplace" 
              className="relative w-full h-auto rounded-lg shadow-2xl neon-glow"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
