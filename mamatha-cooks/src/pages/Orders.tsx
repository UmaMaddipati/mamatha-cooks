import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Package, Truck, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Orders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>({});
  const [trackingLoading, setTrackingLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) return;
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const loadTracking = async (orderId: string, awb: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    
    if (trackingData[orderId] || !awb) return;

    setTrackingLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/orders/track/${awb}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingData((prev: any) => ({ ...prev, [orderId]: data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (loading) return <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container py-8 max-w-4xl min-h-screen">
      <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-border">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold">No orders yet</h2>
          <p className="text-muted-foreground mt-2">Check out our amazing pickles and place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div 
                className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => loadTracking(order._id, order.awbCode)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-lg">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</p>
                    <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount}</p>
                  
                  {order.awbCode && (
                    <p className="text-sm text-blue-600 font-medium flex items-center gap-1 mt-2">
                      <Truck className="w-4 h-4" /> AWB: {order.awbCode}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                   {expandedOrder === order._id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              {expandedOrder === order._id && (
                <div className="p-4 sm:p-6 border-t border-border bg-gray-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Items & details */}
                    <div>
                      <h4 className="font-semibold mb-3">Items</h4>
                      <div className="space-y-2 mb-6">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <h4 className="font-semibold mb-2">Delivery Address</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingAddress.fullName}<br/>
                        {order.shippingAddress.streetAddress}<br/>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                        Ph: {order.shippingAddress.phone}
                      </p>
                    </div>

                    {/* Tracking status */}
                    <div>
                      <h4 className="font-semibold mb-3">Tracking Details</h4>
                      {trackingLoading[order._id] ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Fetching latest tracking info...</div>
                      ) : trackingData[order._id] && trackingData[order._id].tracking_data ? (
                         <div className="space-y-4">
                            <p className="text-sm">Status: <strong className="text-primary">{trackingData[order._id].tracking_data.shipment_status === 1 ? 'AWB Assigned' : trackingData[order._id].tracking_data.shipment_status === 7 ? 'Delivered' : trackingData[order._id].tracking_data.shipment_status === 3 ? 'Picked Up' : 'Processing'}</strong></p>
                            
                            <div className="relative border-l-2 border-primary/30 ml-2 pl-4 space-y-4">
                               {trackingData[order._id].tracking_data.shipment_track_activities?.map((activity: any, actIdx: number) => (
                                 <div key={actIdx} className="relative">
                                    <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-primary rounded-full" />
                                    <p className="text-sm font-medium">{activity.activity}</p>
                                    <p className="text-xs text-muted-foreground">{activity.location} • {activity.date}</p>
                                 </div>
                               ))}
                            </div>
                         </div>
                      ) : order.awbCode ? (
                         <p className="text-sm text-muted-foreground">Tracking information is not immediately available or the AWB is newly assigned. Please check back later.</p>
                      ) : (
                         <p className="text-sm text-muted-foreground">Your order is being processed and AWB is pending assignment.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
