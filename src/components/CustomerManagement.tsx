import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  Search,
  Edit,
  Eye,
  FileText,
  CreditCard,
  Gift,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star
} from "lucide-react";

interface CustomerManagementProps {
  onBack: () => void;
}

export const CustomerManagement = ({ onBack }: CustomerManagementProps) => {
  const [selectedTab, setSelectedTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const customers = [
    {
      id: "CUST001",
      name: "Priya Sharma",
      phone: "+91 9876543210",
      email: "priya.sharma@email.com",
      address: "123 Main St, Mumbai",
      kycStatus: "Verified",
      loyaltyPoints: 2450,
      totalPurchases: "₹2,45,000",
      lastVisit: "2024-01-15",
      memberSince: "2022-03-10"
    },
    {
      id: "CUST002",
      name: "Rajesh Kumar",
      phone: "+91 9876543211",
      email: "rajesh.kumar@email.com",
      address: "456 Park Road, Delhi",
      kycStatus: "Pending",
      loyaltyPoints: 1200,
      totalPurchases: "₹1,20,000",
      lastVisit: "2024-01-12",
      memberSince: "2023-01-20"
    },
    {
      id: "CUST003",
      name: "Anita Patel",
      phone: "+91 9876543212",
      email: "anita.patel@email.com",
      address: "789 Central Ave, Ahmedabad",
      kycStatus: "Verified",
      loyaltyPoints: 3800,
      totalPurchases: "₹3,80,000",
      lastVisit: "2024-01-18",
      memberSince: "2021-11-05"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-cream via-background to-luxury-cream">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-luxury-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Users className="w-6 h-6 text-primary mr-3" />
            <h1 className="text-xl font-semibold text-luxury-dark">Customer Management</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list">Customer List</TabsTrigger>
            <TabsTrigger value="add">Add Customer</TabsTrigger>
            <TabsTrigger value="kyc">KYC Management</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty Program</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Search by name, phone, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:col-span-2"
                  />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="KYC Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Member Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer List */}
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="border-luxury-gold/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-luxury-dark">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">{customer.id}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Phone className="w-3 h-3 mr-1" />
                              {customer.phone}
                            </span>
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1" />
                              {customer.email}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="text-sm font-medium text-luxury-dark">{customer.totalPurchases}</div>
                          <div className="text-xs text-muted-foreground">Total Purchases</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-luxury-dark">{customer.loyaltyPoints}</div>
                          <div className="text-xs text-muted-foreground">Loyalty Points</div>
                        </div>
                        <div className="text-center">
                          <Badge 
                            variant={customer.kycStatus === "Verified" ? "default" : "secondary"}
                            className={customer.kycStatus === "Verified" ? "bg-green-500" : ""}
                          >
                            {customer.kycStatus}
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" placeholder="+91 9876543210" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="customer@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anniversary">Anniversary Date</Label>
                    <Input id="anniversary" type="date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter complete address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter city" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" placeholder="Enter state" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input id="pincode" placeholder="Enter pincode" />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">Cancel</Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Document Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <Card key={customer.id} className="border-luxury-gold/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{customer.name}</h4>
                          <Badge 
                            variant={customer.kycStatus === "Verified" ? "default" : "secondary"}
                            className={customer.kycStatus === "Verified" ? "bg-green-500" : "bg-yellow-500"}
                          >
                            {customer.kycStatus}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Aadhar Card:</span>
                            <span className="text-green-600">✓ Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PAN Card:</span>
                            <span className="text-green-600">✓ Verified</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Address Proof:</span>
                            <span className="text-yellow-600">⏳ Pending</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3">
                          <FileText className="w-4 h-4 mr-2" />
                          Manage Documents
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Loyalty Program Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Members:</span>
                      <span className="font-semibold">2,456</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Members:</span>
                      <span className="font-semibold">1,832</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Points Redeemed:</span>
                      <span className="font-semibold">₹45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Points/Customer:</span>
                      <span className="font-semibold">2,150</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Loyalty Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customers
                      .sort((a, b) => b.loyaltyPoints - a.loyaltyPoints)
                      .map((customer, index) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-semibold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">{customer.loyaltyPoints} pts</p>
                            <p className="text-sm text-muted-foreground">₹{(customer.loyaltyPoints * 0.1).toFixed(0)} value</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};