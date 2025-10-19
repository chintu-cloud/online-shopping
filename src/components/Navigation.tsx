import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { CartDrawer } from "./CartDrawer";

export const Navigation = () => {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <ShoppingBag className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Shop
            </span>
          </Link>
          
          <CartDrawer />
        </div>
      </div>
    </nav>
  );
};
