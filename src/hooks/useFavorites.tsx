import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavorites = (productId?: string) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (productId && isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [productId, isAuthenticated]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const checkFavoriteStatus = async () => {
    if (!productId) return;

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("product_id", productId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFavorite(!!data);
    } catch (error: any) {
      console.error("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (product: {
    id: string;
    handle: string;
    title: string;
    price: string;
    imageUrl?: string;
  }) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add favorites");
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("product_id", product.id);

        if (error) throw error;
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            product_id: product.id,
            product_handle: product.handle,
            product_title: product.title,
            product_price: product.price,
            product_image_url: product.imageUrl,
          });

        if (error) throw error;
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFavorite,
    loading,
    isAuthenticated,
    toggleFavorite,
  };
};
