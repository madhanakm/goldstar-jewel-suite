import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Shield, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  onLogin: (userType: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      toast({
        title: "Login Successful",
        description: "Welcome to JewelCraft Management System",
      });
      onLogin("admin"); // For demo purposes
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Gem className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-luxury-dark">JewelCraft</h1>
          <p className="text-muted-foreground mt-2">Jewelry Management System</p>
        </div>

        <Card className="shadow-2xl border-luxury-gold/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@jewelcraft.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-luxury-gold/30 focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-luxury-gold/30 focus:border-luxury-gold"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <div className="text-sm text-muted-foreground text-center">Demo Credentials:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-muted rounded text-center">
                  <Shield className="w-3 h-3 mx-auto mb-1" />
                  <div>Admin</div>
                  <div className="text-muted-foreground">admin@demo.com</div>
                </div>
                <div className="p-2 bg-muted rounded text-center">
                  <User className="w-3 h-3 mx-auto mb-1" />
                  <div>Staff</div>
                  <div className="text-muted-foreground">staff@demo.com</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Secure jewelry business management platform
        </div>
      </div>
    </div>
  );
};