import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, User, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

interface LoginPageProps {
  onLogin: (userType: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const result = await authService.login({ identifier: email, password });
      console.log('Login result:', result);
      console.log('Is authenticated after login:', authService.isAuthenticated());
      console.log('Token:', authService.getToken());
      console.log('User:', authService.getUser());
      
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md mx-auto">
          {/* Floating Logo */}
          <div className="text-center mb-6">
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-white via-yellow-50 to-orange-50 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30">
                <img 
                  src="https://jewelapi.sricashway.com/uploads/CASHWAY_FINAL_WORK_1_18740501ca_85998da533.png" 
                  alt="Sri Cashway Logo" 
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-yellow-200 to-orange-300 bg-clip-text text-transparent mb-2 tracking-tight">
              Sri Cashway
            </h1>
            <p className="text-white/70 text-sm font-medium tracking-wide">Premium Jewelry Management System</p>
          </div>

          {/* Glass Login Card */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/40 via-orange-500/40 to-pink-500/40 rounded-3xl blur-sm opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
            <Card className="relative bg-white/15 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
              <CardHeader className="relative z-10 text-center pb-4 pt-6">
                <CardTitle className="text-xl font-bold text-white mb-1">Welcome Back</CardTitle>
                <CardDescription className="text-white/80 text-sm">Sign in to access your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 px-6 pb-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90 font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <div className="relative group">
                      <Input
                        type="email"
                        placeholder="admin@cashway.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 rounded-xl backdrop-blur-sm pl-4 pr-12 transition-all duration-300 group-hover:bg-white/15"
                      />
                      <User className="absolute right-3 top-3.5 w-5 h-5 text-white/50 group-hover:text-white/70 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90 font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 rounded-xl backdrop-blur-sm pl-4 pr-12 transition-all duration-300 group-hover:bg-white/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 w-5 h-5 text-white/50 hover:text-white/70 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 ${rememberMe ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 scale-110' : 'border-white/40 bg-white/10 hover:border-white/60'}`}>
                          {rememberMe && (
                            <svg className="w-3 h-3 text-black absolute top-0.5 left-0.5 animate-in zoom-in duration-200" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white/90 text-sm font-medium group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <button type="button" className="text-yellow-300 hover:text-yellow-200 text-sm font-medium transition-colors hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black hover:text-black font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative overflow-hidden group mt-6" 
                    disabled={isLoading}
                  >
                    <span className="relative z-20 flex items-center justify-center text-base text-black">
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin mr-3"></div>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-3 text-black" />
                          Sign In to Dashboard
                        </>  
                      )}
                    </span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="text-center mt-6">
            <div className="inline-flex items-center space-x-2 text-white/70 text-xs font-medium">
              <Gem className="w-3 h-3 animate-bounce text-yellow-300" />
              <span>Secure • Reliable • Professional</span>
              <Gem className="w-3 h-3 animate-bounce delay-500 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};