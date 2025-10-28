import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Table {
  id: string;
  table_number: number;
  is_active: boolean;
  created_at: string;
}

const AdminTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [deleteTableId, setDeleteTableId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchTables();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/auth");
    }
  };

  const fetchTables = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("tables")
      .select("*")
      .order("table_number");

    if (error) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTables(data || []);
    }
    setLoading(false);
  };

  const addTable = async () => {
    const tableNum = parseInt(newTableNumber);
    if (!tableNum || tableNum < 1 || tableNum > 50) {
      toast({
        title: "Xatolik",
        description: "Stol raqami 1 dan 50 gacha bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    const { error } = await (supabase as any)
      .from("tables")
      .insert({ table_number: tableNum, is_active: true });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Xatolik",
          description: "Bu raqamli stol allaqachon mavjud",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Xatolik",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: `${tableNum}-stol qo'shildi`,
      });
      setNewTableNumber("");
      fetchTables();
    }
  };

  const toggleTableStatus = async (tableId: string, currentStatus: boolean) => {
    const { error } = await (supabase as any)
      .from("tables")
      .update({ is_active: !currentStatus })
      .eq("id", tableId);

    if (error) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: `Stol holati o'zgartirildi`,
      });
      fetchTables();
    }
  };

  const deleteTable = async () => {
    if (!deleteTableId) return;

    const { error } = await (supabase as any)
      .from("tables")
      .delete()
      .eq("id", deleteTableId);

    if (error) {
      toast({
        title: "Xatolik",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Muvaffaqiyatli",
        description: "Stol o'chirildi",
      });
      fetchTables();
    }
    setDeleteTableId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/auth");
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
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Stollarni Boshqarish
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Restoran stollarini qo'shish va boshqarish
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/admin/kitchen")} variant="outline">
                Oshxona Paneli
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Chiqish
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Add Table Form */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Yangi Stol Qo'shish</h2>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Stol raqami (1-50)"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              min="1"
              max="50"
              className="max-w-xs"
            />
            <Button onClick={addTable}>
              <Plus className="mr-2 h-4 w-4" />
              Qo'shish
            </Button>
          </div>
        </Card>

        {/* Tables List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`p-6 ${
                table.is_active
                  ? "border-green-500/50"
                  : "border-gray-500/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold">
                    {table.table_number}-stol
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(table.created_at).toLocaleDateString("uz-UZ")}
                  </p>
                </div>
                {table.is_active ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={table.is_active ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={() => toggleTableStatus(table.id, table.is_active)}
                >
                  {table.is_active ? "O'chirish" : "Yoqish"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTableId(table.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {tables.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Hozircha stollar mavjud emas. Yangi stol qo'shing.
            </p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTableId !== null}
        onOpenChange={(open) => !open && setDeleteTableId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stolni o'chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Ushbu stolni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction onClick={deleteTable}>
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTables;
