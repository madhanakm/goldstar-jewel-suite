import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

interface LoginPageProps {
  onLogin: (userType: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authService.login({ identifier: email, password });
      toast({
        title: "Login Successful",
        description: "Welcome to Cashway Jewelshop Management",
      });
      onLogin("admin");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://jewelapi.sricashway.com/uploads/CASHWAY_FINAL_WORK_1_18740501ca_85998da533.png" 
              alt="Sri Cashway Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-luxury-dark">Sri Cashway</h1>
          <p className="text-muted-foreground mt-2">Cashway Jewelshop Management</p>
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
                  placeholder="admin@cashway.com"
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
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                <User className="w-4 h-4 mr-2" />
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>


          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          Secure jewelry business management platform
        </div>
      </div>
    </div>
  );
};