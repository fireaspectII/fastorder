import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";

const TableSelector = () => {
  const navigate = useNavigate();
  const tables = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-12">
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
            Select your table to start ordering
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {tables.map((table) => (
            <Card
              key={table}
              className="aspect-square hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate(`/menu?table=${table}`)}
            >
              <div className="h-full flex flex-col items-center justify-center p-4">
                <Utensils className="h-8 w-8 text-primary mb-2" />
                <span className="text-3xl font-bold">{table}</span>
                <span className="text-sm text-muted-foreground mt-1">Table</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate("/admin/auth")}
          >
            Kitchen Admin Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableSelector;
