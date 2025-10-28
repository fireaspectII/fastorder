import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Table {
  id: string;
  table_number: number;
  is_active: boolean;
}

const TableSelector = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("tables")
      .select("*")
      .eq("is_active", true)
      .order("table_number");

    if (error) {
      toast({
        title: "Xatolik",
        description: "Stollarni yuklashda xatolik yuz berdi",
        variant: "destructive",
      });
    } else {
      setTables(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Orqaga qaytish
          </Button>
        </div>
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Utensils className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gourmet Restaurant
          </h1>
          <p className="text-xl text-muted-foreground">
            Buyurtma berish uchun stolingizni tanlang
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {tables.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                Hozircha faol stollar mavjud emas
              </p>
            </div>
          ) : (
            tables.map((table) => (
              <Card
                key={table.id}
                className="aspect-square hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/menu?table=${table.table_number}`)}
              >
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <Utensils className="h-8 w-8 text-primary mb-2" />
                  <span className="text-3xl font-bold">{table.table_number}</span>
                  <span className="text-sm text-muted-foreground mt-1">Stol</span>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default TableSelector;
