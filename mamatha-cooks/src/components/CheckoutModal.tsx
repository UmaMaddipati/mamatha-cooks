import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth, User } from "@/context/AuthContext";
import { getWhatsAppUrl } from "@/components/WhatsAppButton";
import { MessageCircle, Plus, MapPin, Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export const CheckoutModal = ({ items, totalPrice, whatsappMsg }: { items: any[], totalPrice: number, whatsappMsg: string }) => {
  const { user, token, setUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "payment">("address");
  const [open, setOpen] = useState(false);
  
  // New address form state
  const [formData, setFormData] = useState({
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  // Handle adding new address using backend api
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch("https://mamatha-cooks-api.onrender.com/api/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success("Address added successfully!");
        // Update user state context
        setUser((prev: User | null) => prev ? { ...prev, addresses: data.addresses } : null);
        setIsAddingNew(false);
        // Automatically select the newly added address
        setSelectedAddress(data.addresses.length - 1);
        setFormData({ fullName: "", streetAddress: "", city: "", state: "", zipCode: "", phone: "" });
      } else {
        toast.error(data.message || "Failed to add address");
      }
    } catch (error) {
      toast.error("An error occurred adding address.");
    } finally {
      setLoading(false);
    }
  };

  const verifySelectionAndProceed = () => {
    if (selectedAddress === null && user?.addresses && user?.addresses.length > 0) {
       toast.error("Please select a delivery address");
       return;
    }
    // Proceed to payment step
    setStep("payment");
  };

  const handleConfirmPayment = async () => {
    if (!token || selectedAddress === null) return;
    
    try {
      setLoading(true);
      // Generate Order in Backend
      const res = await fetch("https://mamatha-cooks-api.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ items, totalPrice, addressIndex: selectedAddress })
      });

      if (!res.ok) {
         throw new Error("Failed to create order");
      }
      
      // Generating WhatsApp Message
      let finalMsg = `Hi, I have made the payment of ₹${totalPrice} and want to order from Mamatha Cooks:\n\n${whatsappMsg}\n\n*Total Paid:* ₹${totalPrice}`;
      
      const addr: any = user!.addresses[selectedAddress];
      finalMsg += `\n\n*Delivery Address:*\n${addr.fullName}\n${addr.streetAddress}\n${addr.city}, ${addr.state} ${addr.zipCode}\nPhone: ${addr.phone}`;

      toast.success("Order Placed Successfully!");
      
      // Clear cart and close dialog after short timeout
      setTimeout(() => {
        window.open(getWhatsAppUrl(finalMsg), "_blank");
        clearCart();
        setOpen(false);
        setStep("address"); // Reset back for next time
        navigate("/orders");
      }, 1000);

    } catch (e) {
      toast.error("Failed to process order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button className="flex-1 bg-primary text-primary-foreground font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity" onClick={() => toast.error("Please login to proceed to checkout.")}>
        Proceed to Checkout
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-primary text-primary-foreground font-body font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
          Proceed to Checkout
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white">
        {step === "address" && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Select Delivery Address</DialogTitle>
              <DialogDescription className="hidden">Select or add a new delivery address to proceed to checkout.</DialogDescription>
            </DialogHeader>

            {!isAddingNew ? (
              <div className="flex flex-col gap-4 mt-4">
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {user.addresses.map((addr: any, index: number) => (
                      <div 
                        key={index} 
                        onClick={() => setSelectedAddress(index)}
                        className={`border p-4 rounded-lg cursor-pointer transition-colors ${selectedAddress === index ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className={`w-5 h-5 mt-0.5 ${selectedAddress === index ? 'text-primary' : 'text-muted-foreground'}`}/>
                          <div>
                            <p className="font-semibold text-sm">{addr.fullName}</p>
                            <p className="text-sm text-muted-foreground">{addr.streetAddress}, {addr.city}</p>
                            <p className="text-sm text-muted-foreground">{addr.state} - {addr.zipCode}</p>
                            <p className="text-sm text-muted-foreground mt-1">📞 {addr.phone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">No addresses found. Add one to continue.</p>
                )}

                <Button variant="outline" className="w-full gap-2" onClick={() => setIsAddingNew(true)}>
                  <Plus className="w-4 h-4" /> Add New Address
                </Button>

                <Button onClick={verifySelectionAndProceed} className="w-full gap-2 mt-4" disabled={user.addresses?.length > 0 && selectedAddress === null}>
                  Proceed to Payment
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAddAddress} className="flex flex-col gap-3 mt-4">
                <input 
                  type="text" required placeholder="Full Name" 
                  className="w-full px-3 py-2 border rounded-md text-sm" 
                  value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
                <input 
                  type="text" required placeholder="Street Address" 
                  className="w-full px-3 py-2 border rounded-md text-sm" 
                  value={formData.streetAddress} onChange={e => setFormData({...formData, streetAddress: e.target.value})}
                />
                <div className="flex gap-2">
                  <input 
                    type="text" required placeholder="City" 
                    className="w-full px-3 py-2 border rounded-md text-sm" 
                    value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                  <input 
                    type="text" required placeholder="State" 
                    className="w-full px-3 py-2 border rounded-md text-sm" 
                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" required placeholder="Zip Code" 
                    className="w-full px-3 py-2 border rounded-md text-sm" 
                    value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})}
                  />
                  <input 
                    type="text" required placeholder="Phone Number" 
                    className="w-full px-3 py-2 border rounded-md text-sm" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAddingNew(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Address"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {step === "payment" && (
          <div className="flex flex-col items-center">
            <DialogHeader className="w-full items-center text-center">
              <DialogTitle className="font-display text-xl">Scan to Pay</DialogTitle>
              <DialogDescription className="hidden">Scan QR code to make payment.</DialogDescription>
            </DialogHeader>
            
            <p className="text-muted-foreground text-sm my-4">Please scan the QR code to complete the payment of <strong>₹{totalPrice}</strong></p>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-border inline-block">
              {/* IMPORTANT: Replace "mamathacooks@ybl" with your actual merchant UPI ID below */}
              <img 
                src={`https://quickchart.io/qr?size=250x250&text=${encodeURIComponent(`upi://pay?pa=mamathacooks@ybl&pn=Mamatha Cooks&am=${totalPrice}&cu=INR`)}`} 
                alt="Dynamic Payment QR Code" 
                className="w-48 h-48 object-cover rounded-md" 
              />
            </div>
            
            <div className="flex w-full gap-3 mt-8">
               <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("address")} disabled={loading}>Back</Button>
               <Button onClick={handleConfirmPayment} className="flex-1 gap-2 bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Payment"}
               </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
