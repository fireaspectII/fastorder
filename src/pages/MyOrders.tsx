import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, ChefHat, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  table_number: number;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  item_price: number;
  notes: string | null;
  menu_items: {
    name: string;
    image_url: string;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  received: { label: "Qabul qilindi", color: "bg-blue-500", icon: Clock },
  preparing: { label: "Tayyorlanmoqda", color: "bg-yellow-500", icon: ChefHat },
  ready: { label: "Tayyor", color: "bg-green-500", icon: CheckCircle },
  delivered: { label: "Yetkazildi", color: "bg-gray-500", icon: CheckCircle },
};

const MyOrders = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tableNumber = parseInt(searchParams.get("table") || "1");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Real-time subscription
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `table_number=eq.${tableNumber}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableNumber]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("table_number", tableNumber)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Fetch order items for each order
      if (ordersData && ordersData.length > 0) {
        const itemsMap: Record<string, OrderItem[]> = {};
        
        for (const order of ordersData) {
          const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select(`
              id,
              quantity,
              item_price,
              notes,
              menu_items (
                name,
                image_url
              )
            `)
            .eq("order_id", order.id);

          if (!itemsError && items) {
            itemsMap[order.id] = items as any;
          }
        }
        
        setOrderItems(itemsMap);
      }
    } catch (error: any) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/menu?table=${tableNumber}`)}
            size="sm"
            className="gap-2 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Menyuga qaytish
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Buyurtmalarim
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tableNumber}-stol
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Hozircha buyurtmalar yo'q
            </p>
            <Button onClick={() => navigate(`/menu?table=${tableNumber}`)}>
              Menyu ko'rish
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.received;
              const StatusIcon = status.icon;
              const items = orderItems[order.id] || [];

              return (
                <Card key={order.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${status.color} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} • {formatTime(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          ${order.total_price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold">Izoh:</span> {order.notes}
                        </p>
                      </div>
                    )}

                    <ScrollArea className="h-auto max-h-64">
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                          >
                            <img
                              src={item.menu_items.image_url}
                              alt={item.menu_items.name}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                {item.menu_items.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x ${item.item_price.toFixed(2)}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.notes}
                                </p>
                              )}
                            </div>
                            <div className="font-semibold">
                              ${(item.quantity * item.item_price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
