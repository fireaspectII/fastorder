import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Utensils, ChefHat, Clock, Award } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-primary/10 rounded-full">
              <Utensils className="h-20 w-20 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Gourmet Restaurant
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 leading-relaxed">
            Zamonaviy buyurtma tizimi bilan ta'bdagi lazzatli taomlar
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Bizning restoramizda eng yaxshi oshpazlar tomonidan tayyorlangan 
            maxsus taomlardan bahramand bo'ling. Har bir taom - bu san'at asari!
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6"
            onClick={() => navigate("/tables")}
          >
            Buyurtma berish
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <ChefHat className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Professional Oshpazlar</h3>
            <p className="text-muted-foreground">
              20 yillik tajribaga ega malakali oshpazlarimiz har bir taomni 
              muhabbat bilan tayyorlaydi
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Clock className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Tez Xizmat</h3>
            <p className="text-muted-foreground">
              Zamonaviy texnologiya yordamida buyurtmangiz tezkor 
              va aniq bajariladi
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Award className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-3">Yuqori Sifat</h3>
            <p className="text-muted-foreground">
              Faqat yangi va sifatli mahsulotlardan foydalanib, 
              eng mazali taomlar tayyorlaymiz
            </p>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Biz haqimizda</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Gourmet Restaurant 2010-yildan beri mijozlarimizga xizmat ko'rsatib kelmoqda. 
              Bizning maqsadimiz - har bir mehmonimizga unutilmas ta'm tajribasini taqdim etish.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Zamonaviy raqamli buyurtma tizimimiz orqali siz qulay va tezkor tarzda 
              sevimli taomlaringizni buyurtma qilishingiz mumkin. Har bir stol uchun 
              maxsus interfeys va real vaqt rejimida oshxonaga buyurtmalar yuborish imkoniyati mavjud.
            </p>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-20 border-t">
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/auth")}
          >
            Admin Panel
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            © 2024 Gourmet Restaurant. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
