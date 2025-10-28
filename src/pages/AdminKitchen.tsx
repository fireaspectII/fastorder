import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Clock, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Order {
  id: string;
  table_number: number;
  status: string;
  total_price: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  quantity: number;
  item_price: number;
  notes: string;
  menu_items: {
    name: string;
    category: string;
  };
}

const statusColors: Record<string, string> = {
  received: "bg-blue-500",
  preparing: "bg-yellow-500",
  ready: "bg-green-500",
  delivered: "bg-gray-500",
};

const statusLabels: Record<string, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
};

const AdminKitchen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchOrders();
    
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/auth");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data: ordersData, error: ordersError } = await (supabase as any)
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      toast({
        title: "Error loading orders",
        description: ordersError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setOrders(ordersData || []);

    const itemsMap: Record<string, OrderItem[]> = {};
    for (const order of ordersData || []) {
      const { data: items } = await (supabase as any)
        .from("order_items")
        .select("*, menu_items(name, category)")
        .eq("order_id", order.id);
      
      if (items) {
        itemsMap[order.id] = items;
      }
    }
    
    setOrderItems(itemsMap);
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await (supabase as any)
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order updated",
        description: `Order status changed to ${statusLabels[newStatus]}`,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Kitchen Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time order management
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/admin/tables")} variant="outline">
                Stollar Boshqaruvi
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              New orders will appear here in real-time
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">
                      Table {order.table_number}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(order.created_at)}</span>
                      <span>•</span>
                      <span>{getTimeSince(order.created_at)}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                </div>

                <ScrollArea className="h-48 mb-4">
                  <div className="space-y-2">
                    {orderItems[order.id]?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-start p-2 bg-muted/50 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium">
                            {item.quantity}x {item.menu_items.name}
                          </span>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Note: {item.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-sm font-semibold">
                          ${(item.item_price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {order.notes && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Order Notes:
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {order.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">
                    ${order.total_price.toFixed(2)}
                  </span>
                </div>

                <Select
                  value={order.status}
                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminKitchen;
