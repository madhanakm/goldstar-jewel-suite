import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, Calendar, CreditCard, FileText, Calculator, Receipt, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FinancialModulesProps {
  onBack: () => void;
}

interface GoldLoan {
  id: string;
  customerName: string;
  customerPhone: string;
  loanAmount: number;
  goldWeight: number;
  goldPurity: string;
  interestRate: number;
  loanDate: string;
  dueDate: string;
  status: 'Active' | 'Closed' | 'Overdue';
  amountPaid: number;
}

interface AdvanceBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  itemDescription: string;
  estimatedValue: number;
  advanceAmount: number;
  remainingAmount: number;
  bookingDate: string;
  deliveryDate: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

interface GSTReport {
  month: string;
  sales: number;
  purchases: number;
  taxCollected: number;
  taxPaid: number;
  netTax: number;
  status: 'Filed' | 'Pending' | 'Due';
}

export const FinancialModules = ({ onBack }: FinancialModulesProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("goldloan");
  const [isAddLoanOpen, setIsAddLoanOpen] = useState(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);

  const mockGoldLoans: GoldLoan[] = [
    {
      id: "GL001",
      customerName: "Rajesh Kumar",
      customerPhone: "+91 98765 43210",
      loanAmount: 50000,
      goldWeight: 15.5,
      goldPurity: "22K",
      interestRate: 12,
      loanDate: "2024-01-01",
      dueDate: "2024-04-01",
      status: "Active",
      amountPaid: 15000
    },
    {
      id: "GL002",
      customerName: "Priya Sharma",
      customerPhone: "+91 87654 32109",
      loanAmount: 75000,
      goldWeight: 25.2,
      goldPurity: "18K",
      interestRate: 12,
      loanDate: "2024-01-15",
      dueDate: "2024-04-15",
      status: "Active",
      amountPaid: 25000
    }
  ];

  const mockAdvanceBookings: AdvanceBooking[] = [
    {
      id: "AB001",
      customerName: "Amit Patel",
      customerPhone: "+91 76543 21098",
      itemDescription: "Custom Gold Necklace Set",
      estimatedValue: 120000,
      advanceAmount: 30000,
      remainingAmount: 90000,
      bookingDate: "2024-01-10",
      deliveryDate: "2024-02-15",
      status: "Active"
    },
    {
      id: "AB002",
      customerName: "Neha Singh",
      customerPhone: "+91 65432 10987",
      itemDescription: "Diamond Engagement Ring",
      estimatedValue: 85000,
      advanceAmount: 25000,
      remainingAmount: 60000,
      bookingDate: "2024-01-12",
      deliveryDate: "2024-02-20",
      status: "Active"
    }
  ];

  const mockGSTReports: GSTReport[] = [
    {
      month: "Dec 2023",
      sales: 450000,
      purchases: 180000,
      taxCollected: 13500,
      taxPaid: 5400,
      netTax: 8100,
      status: "Filed"
    },
    {
      month: "Jan 2024",
      sales: 520000,
      purchases: 220000,
      taxCollected: 15600,
      taxPaid: 6600,
      netTax: 9000,
      status: "Pending"
    }
  ];

  const handleAddLoan = () => {
    toast({
      title: "Gold Loan Added",
      description: "New gold loan record has been created successfully.",
    });
    setIsAddLoanOpen(false);
  };

  const handleAddBooking = () => {
    toast({
      title: "Advance Booking Added",
      description: "New advance booking has been recorded successfully.",
    });
    setIsAddBookingOpen(false);
  };

  const totalLoansValue = mockGoldLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  const totalAdvancesValue = mockAdvanceBookings.reduce((sum, booking) => sum + booking.advanceAmount, 0);
  const pendingTax = mockGSTReports.filter(report => report.status === 'Pending').reduce((sum, report) => sum + report.netTax, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-luxury-dark">Financial Modules</h1>
          <p className="text-muted-foreground">Manage gold loans, advance bookings, and financial reports</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                <p className="text-2xl font-bold">{mockGoldLoans.filter(loan => loan.status === 'Active').length}</p>
                <p className="text-sm text-muted-foreground">₹{totalLoansValue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Advance Bookings</p>
                <p className="text-2xl font-bold">{mockAdvanceBookings.filter(booking => booking.status === 'Active').length}</p>
                <p className="text-sm text-muted-foreground">₹{totalAdvancesValue.toLocaleString()}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending GST</p>
                <p className="text-2xl font-bold text-orange-600">₹{pendingTax.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹5.2L</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goldloan">Gold Loans</TabsTrigger>
          <TabsTrigger value="advance">Advance Bookings</TabsTrigger>
          <TabsTrigger value="gst">GST & Accounting</TabsTrigger>
        </TabsList>

        {/* Gold Loans Tab */}
        <TabsContent value="goldloan" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gold Loan Management</h3>
            <Dialog open={isAddLoanOpen} onOpenChange={setIsAddLoanOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Gold Loan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Gold Loan</DialogTitle>
                  <DialogDescription>Record a new gold loan against customer jewelry</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input placeholder="Enter customer name" />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input placeholder="Enter phone number" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="goldWeight">Gold Weight (g)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div>
                      <Label htmlFor="goldPurity">Purity</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24K">24K</SelectItem>
                          <SelectItem value="22K">22K</SelectItem>
                          <SelectItem value="18K">18K</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loanAmount">Loan Amount</Label>
                      <Input type="number" placeholder="₹ 0" />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input type="number" placeholder="12" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea placeholder="Any additional notes" />
                  </div>
                  <Button onClick={handleAddLoan} className="w-full">Create Loan</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loan ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Gold Details</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGoldLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{loan.customerName}</p>
                          <p className="text-sm text-muted-foreground">{loan.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{loan.goldWeight}g</p>
                          <p className="text-sm text-muted-foreground">{loan.goldPurity}</p>
                        </div>
                      </TableCell>
                      <TableCell>₹{loan.loanAmount.toLocaleString()}</TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>{loan.dueDate}</TableCell>
                      <TableCell>₹{loan.amountPaid.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={loan.status === "Active" ? "default" : "secondary"}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Payment</Button>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advance Bookings Tab */}
        <TabsContent value="advance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Advance Bookings</h3>
            <Dialog open={isAddBookingOpen} onOpenChange={setIsAddBookingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Booking
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Advance Booking</DialogTitle>
                  <DialogDescription>Record a new advance booking for custom jewelry</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input placeholder="Enter customer name" />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input placeholder="Enter phone number" />
                  </div>
                  <div>
                    <Label htmlFor="itemDescription">Item Description</Label>
                    <Textarea placeholder="Describe the custom jewelry item" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedValue">Estimated Value</Label>
                      <Input type="number" placeholder="₹ 0" />
                    </div>
                    <div>
                      <Label htmlFor="advanceAmount">Advance Amount</Label>
                      <Input type="number" placeholder="₹ 0" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Expected Delivery</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea placeholder="Any special requirements or notes" />
                  </div>
                  <Button onClick={handleAddBooking} className="w-full">Create Booking</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>Estimated Value</TableHead>
                    <TableHead>Advance Paid</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Delivery Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAdvanceBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.customerPhone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{booking.itemDescription}</TableCell>
                      <TableCell>₹{booking.estimatedValue.toLocaleString()}</TableCell>
                      <TableCell>₹{booking.advanceAmount.toLocaleString()}</TableCell>
                      <TableCell>₹{booking.remainingAmount.toLocaleString()}</TableCell>
                      <TableCell>{booking.deliveryDate}</TableCell>
                      <TableCell>
                        <Badge variant={booking.status === "Active" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">Update</Button>
                          <Button size="sm" variant="outline">Complete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GST & Accounting Tab */}
        <TabsContent value="gst" className="space-y-4">
          <h3 className="text-lg font-semibold">GST Reports & Accounting</h3>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly GST Summary</CardTitle>
              <CardDescription>GST collection and payment summary by month</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Purchases</TableHead>
                    <TableHead>Tax Collected</TableHead>
                    <TableHead>Tax Paid</TableHead>
                    <TableHead>Net Tax</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGSTReports.map((report, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{report.month}</TableCell>
                      <TableCell>₹{report.sales.toLocaleString()}</TableCell>
                      <TableCell>₹{report.purchases.toLocaleString()}</TableCell>
                      <TableCell>₹{report.taxCollected.toLocaleString()}</TableCell>
                      <TableCell>₹{report.taxPaid.toLocaleString()}</TableCell>
                      <TableCell>₹{report.netTax.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={report.status === "Filed" ? "default" : "destructive"}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Receipt className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Calculator className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate GSTR-1
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate GSTR-3B
                </Button>
                <Button className="w-full" variant="outline">
                  <Calculator className="w-4 h-4 mr-2" />
                  P&L Statement
                </Button>
                <Button className="w-full" variant="outline">
                  <Receipt className="w-4 h-4 mr-2" />
                  Tax Calculator
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Monthly Sales:</span>
                  <span className="font-medium">₹5,20,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Purchases:</span>
                  <span className="font-medium">₹2,20,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Gross Profit:</span>
                  <span className="font-medium text-green-600">₹3,00,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Tax Liability:</span>
                  <span className="font-medium">₹9,000</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};