import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { storefrontApiRequest, GET_PRODUCT_BY_HANDLE } from "@/lib/shopify";
import { ShopifyProduct, useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await storefrontApiRequest(GET_PRODUCT_BY_HANDLE, { handle });
        if (data?.data?.productByHandle) {
          const productData = { node: data.data.productByHandle };
          setProduct(productData);
          setSelectedVariant(data.data.productByHandle.variants.edges[0]?.node);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const cartItem = {
      product,
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity: 1,
      selectedOptions: selectedVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success("Added to cart", {
      description: `${product.node.title} has been added to your cart`,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product not found</h1>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const { node } = product;
  const mainImage = node.images.edges[0]?.node;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-secondary/20">
                {mainImage ? (
                  <img
                    src={mainImage.url}
                    alt={mainImage.altText || node.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {node.images.edges.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {node.images.edges.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-secondary/20">
                      <img
                        src={img.node.url}
                        alt={img.node.altText || `${node.title} ${idx + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{node.title}</h1>
                <p className="text-3xl font-bold text-primary mb-6">
                  {selectedVariant?.price.currencyCode} ${parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
                </p>
                
                {selectedVariant?.availableForSale ? (
                  <Badge variant="secondary" className="mb-6">In Stock</Badge>
                ) : (
                  <Badge variant="destructive" className="mb-6">Out of Stock</Badge>
                )}
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground">{node.description}</p>
              </div>

              {node.options.length > 0 && node.options[0].values.length > 1 && (
                <div className="space-y-4">
                  {node.options.map((option) => (
                    <div key={option.name}>
                      <label className="text-sm font-medium mb-2 block">{option.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                          const variant = node.variants.edges.find(v =>
                            v.node.selectedOptions.some(opt => opt.value === value)
                          )?.node;
                          
                          return (
                            <Button
                              key={value}
                              variant={selectedVariant?.id === variant?.id ? "default" : "outline"}
                              onClick={() => variant && setSelectedVariant(variant)}
                              disabled={!variant?.availableForSale}
                            >
                              {value}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={handleAddToCart}
                className="w-full py-6 text-lg"
                size="lg"
                disabled={!selectedVariant?.availableForSale}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
